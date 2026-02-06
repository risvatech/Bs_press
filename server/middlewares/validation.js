import Joi from 'joi';

export const validateQuote = (req, res, next) => {
    const schema = Joi.object({
        name: Joi.string().max(255).required(),
        company: Joi.string().max(255).required(),
        email: Joi.string().email().max(255).required(),
        phone: Joi.string().max(20).required(),
        country: Joi.string().max(100).default('India'),
        state: Joi.string().max(100).required(),
        city: Joi.string().max(100).required(),
        projectType: Joi.string().max(100).required(),
        productType: Joi.string().max(255),
        quantity: Joi.string().max(100),
        deliveryDate: Joi.string().max(20),
        budget: Joi.string().max(50).required(),
        additionalRequirements: Joi.string(),
        quoteReference: Joi.string().max(50),
        source: Joi.string().max(50).default('website')
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: error.details.map(detail => detail.message)
        });
    }

    next();
};