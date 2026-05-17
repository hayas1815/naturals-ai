const model = require('../config/gemini');
const cloudinary = require('../config/cloudinary');
const supabase = require('../config/supabase');
const logger = require('../utils/logger');

/**
 * Service to handle uploading image to Cloudinary and analyzing with Gemini
 */
class AIService {
    
    // Converts a local multer buffer to base64 for Gemini
    static bufferToGenerativePart(buffer, mimeType) {
        return {
            inlineData: {
                data: buffer.toString("base64"),
                mimeType
            },
        };
    }

    static async analyzeFaceAndHair(imageBuffer, mimeType, profileId) {
        try {
            // 1. Upload to Cloudinary for permanent storage (in a real app we'd stream the buffer)
            // For simplicity here, we assume upload via stream or base64
            const b64 = Buffer.from(imageBuffer).toString('base64');
            const dataURI = "data:" + mimeType + ";base64," + b64;
            
            const cloudinaryRes = await cloudinary.uploader.upload(dataURI, {
                folder: 'naturals_ai_passports',
            });
            const imageUrl = cloudinaryRes.secure_url;

            // 2. Pass to Gemini for Analysis
            const imagePart = this.bufferToGenerativePart(imageBuffer, mimeType);
            const prompt = `
                You are a world-class AI dermatologist and beauty expert. 
                Analyze this face/hair image and return a JSON object with the following structure exactly (no markdown formatting, just JSON):
                {
                    "skin_type": "string (e.g., Oily, Dry, Combination, Normal)",
                    "hydration_level": "number (0-100)",
                    "elasticity_score": "number (0-100)",
                    "primary_concerns": ["array of strings"],
                    "beauty_score": "number (0-100)",
                    "analysis_summary": "string"
                }
            `;

            const result = await model.generateContent([prompt, imagePart]);
            const responseText = result.response.text();
            
            // Clean up the response in case Gemini adds markdown like ```json ... ```
            const cleanJsonStr = responseText.replace(/```json\n?|```/g, '').trim();
            const analysisData = JSON.parse(cleanJsonStr);

            // 3. Save to Supabase (ai_reports)
            const { data: reportData, error: reportError } = await supabase
                .from('ai_reports')
                .insert({
                    profile_id: profileId,
                    face_image_url: imageUrl,
                    raw_gemini_payload: analysisData,
                    detected_concerns: analysisData.primary_concerns || []
                })
                .select()
                .single();

            if (reportError) {
                logger.error("Supabase insert error", reportError);
                throw new Error("Failed to save AI report to database");
            }

            // 4. Update Profile beauty score and history
            await supabase.from('beauty_scores').insert({ 
                profile_id: profileId,
                overall_score: analysisData.beauty_score,
                skin_health_score: analysisData.hydration_level // approx
            });
            
            await supabase.from('beauty_timelines').insert([
                { profile_id: profileId, metric_name: 'hydration', metric_value: analysisData.hydration_level },
                { profile_id: profileId, metric_name: 'elasticity', metric_value: analysisData.elasticity_score }
            ]);

            return {
                imageUrl,
                analysis: analysisData,
                reportId: reportData?.id
            };

        } catch (error) {
            logger.error(`Error in AIService.analyzeFaceAndHair: ${error.message}`);
            throw error;
        }
    }
}

module.exports = AIService;
