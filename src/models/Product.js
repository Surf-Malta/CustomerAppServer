const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    product_id: {
        type: Number,
        required: [true, 'Please add a product_id'],
        unique: true,
        index: true
    },
    product: {
        type: String,
        required: [true, 'Please add a product name'],
        index: 'text'
    },
    company_id: Number,
    category_ids: [Number],
    price: Number,
    full_description: String,
    status: String,
    product_code: String,
    list_price: Number,
    amount: Number,
    timestamp: String,
    short_description: String,
    popularity: Number,
    search_words: {
        type: String,
        index: 'text'
    },
    promo_text: String,
    seo_name: String,
    prices: mongoose.Schema.Types.Mixed,
    product_features: mongoose.Schema.Types.Mixed,
    add_new_variant: mongoose.Schema.Types.Mixed,
    is_returnable: String,
    return_period: Number,
    sales_amount: Number,
    tags: [String],
    ab__vg_videos: mongoose.Schema.Types.Mixed,

    // ─── NEW: vector embedding for semantic search ───
    embedding: {
        type: [Number],
        default: undefined
    },

    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false,
    timestamps: true
});

ProductSchema.index({
    product: 'text',
    search_words: 'text',
    short_description: 'text',
    full_description: 'text'
});

module.exports = mongoose.model('Product', ProductSchema);