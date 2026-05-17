const axios = require('axios');

function buildProductText(productData, categoryNames = []) {
    const parts = [];

    if (productData.product) {
        parts.push(productData.product.trim());
    }

    const desc = productData.short_description || productData.full_description || '';
    const cleanDesc = desc.replace(/<[^>]*>/g, '').trim();
    if (cleanDesc) parts.push(cleanDesc);

    if (productData.search_words) {
        parts.push(productData.search_words.trim());
    }

    if (productData.tags && productData.tags.length > 0) {
        parts.push(productData.tags.join(', '));
    }

    // ─── category names fetched from categories collection ───
    if (categoryNames.length > 0) {
        parts.push(categoryNames.join(', '));
    }

    return parts.join(', ').slice(0, 2000);
}

async function fetchCategoryNames(categoryIds = []) {
    if (!categoryIds || categoryIds.length === 0) return [];

    try {
        const Category = require('../models/Category');

        const categories = await Category.find(
            { category_id: { $in: categoryIds } },
            { category: 1 }
        );

        return categories.map(c => c.category).filter(Boolean);
    } catch (err) {
        console.error('[Embedding] Failed to fetch category names:', err.message);
        return [];
    }
}

async function generateEmbedding(text) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${process.env.GEMINI_API_KEY}`;

    const response = await axios.post(url, {
        content: {
            parts: [{ text }]
        }
    });

    return response.data.embedding.values;
}

module.exports = { buildProductText, fetchCategoryNames, generateEmbedding };