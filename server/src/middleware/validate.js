const { z } = require('zod');

/**
 * Validates req.body using a Zod schema.
 * Returns 400 with detailed field errors if validation fails.
 * 
 * Usage: router.post('/route', validate(mySchema), handler)
 */
const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: fieldErrors,
        });
    }
    req.body = result.data; // Use the parsed & sanitized data
    next();
};

// ─── Validation Schemas ────────────────────────────────────────────────────

const profileUpdateSchema = z.object({
    full_name: z.string().min(1).max(100).optional(),
    phone: z.string().max(20).optional(),
    date_of_birth: z.string().optional(),
    skin_type: z.enum(['normal', 'oily', 'dry', 'combination', 'sensitive']).optional(),
    hair_type: z.enum(['straight', 'wavy', 'curly', 'coily']).optional(),
    allergies: z.array(z.string()).optional(),
    preferred_products: z.array(z.string()).optional(),
});

const appointmentSchema = z.object({
    salon_id: z.string().uuid(),
    stylist_id: z.string().uuid().optional(),
    scheduled_at: z.string().datetime(),
    service_type: z.string().min(1).max(100),
    notes: z.string().max(500).optional(),
});

module.exports = { validate, profileUpdateSchema, appointmentSchema };
