exports.searchProducts = async (params) => {
  console.log(
    `[ProductService] MOCK SEARCH - Received params: ${JSON.stringify(params)}`,
  );

  return {
    products: [
      {
        product_id: "1",
        product: "Mock Sample Shirt",
        price: "19.99",
        main_pair: {
          detailed: { image_path: "https://via.placeholder.com/150" },
        },
      },
    ],
    total_items: 1,
  };
};
