const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    category_id: {
        type: Number,
        required: [true, 'Please add a category_id'],
        unique: true,
        index: true
    },
    parent_id: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category name']
    },
    description: String,
    status: String,
    page_title: String,
    meta_description: String,
    meta_keywords: String,
    usergroup_ids: mongoose.Schema.Types.Mixed,
    position: Number,
    timestamp: String,
    product_details_view: String,
    use_custom_templates: String,
    ab__lc_catalog_image_control: String,
    ab__lc_landing: String,
    ab__lc_subsubcategories: mongoose.Schema.Types.Mixed,
    ab__lc_menu_id: mongoose.Schema.Types.Mixed,
    ab__lc_how_to_use_menu: String,
    ab__lc_inherit_control: String,
    ab__fn_category_status: String,
    ab__fn_use_origin_image: String,
    ab__fn_label_show: String,
    ab__fn_label_text: String,
    ab__fn_label_color: String,
    ab__fn_label_background: String,
    seo_name: String,
    search_phrases: String,
    mega_m_category_svg_icon: String,
    mega_m_category_banner_url: String,
    discussion_type: String,
    old_company_id: Number,
    company_id: Number,
    updated_at: {
        type: Date,
        default: Date.now
    }
}, {
    strict: false,
    timestamps: true
});

module.exports = mongoose.model('Category', CategorySchema);