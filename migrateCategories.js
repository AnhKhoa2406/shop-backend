// migrateCategories.js
// Chạy MỘT LẦN để đổi hàng loạt giá trị category / subCategory trong DB
// từ tiếng Anh sang tiếng Việt, không cần sửa tay từng sản phẩm.
//
// Cách chạy:
//   npm install mongoose   (nếu chưa có)
//   node migrateCategories.js

import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://meosun2406_db_user:Dqbl4CLEMiyPmhZo@cluster0.gbyxpg5.mongodb.net/e-commerce';

// 👉 Thay bằng đúng tên collection sản phẩm của bạn (thường là "products")
const COLLECTION_NAME = 'products';

// ---- Bảng ánh xạ tiếng Anh -> tiếng Việt ----
const categoryMap = {
  Men: 'Nam',
  Women: 'Nữ',
  Kids: 'Trẻ em',
};

const subCategoryMap = {
  Topwear: 'Áo',
  Bottomwear: 'Quần',
  Winterwear: 'Đồ mùa đông',
};

async function run() {
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  const collection = db.collection(COLLECTION_NAME);

  console.log('Đang kết nối tới:', db.databaseName);

  let totalUpdated = 0;

  for (const [en, vi] of Object.entries(categoryMap)) {
    const result = await collection.updateMany(
      { category: en },
      { $set: { category: vi } }
    );
    console.log(`category: "${en}" -> "${vi}"  (${result.modifiedCount} sản phẩm)`);
    totalUpdated += result.modifiedCount;
  }

  for (const [en, vi] of Object.entries(subCategoryMap)) {
    const result = await collection.updateMany(
      { subCategory: en },
      { $set: { subCategory: vi } }
    );
    console.log(`subCategory: "${en}" -> "${vi}"  (${result.modifiedCount} sản phẩm)`);
    totalUpdated += result.modifiedCount;
  }

  console.log(`\nHoàn tất. Tổng số lượt cập nhật: ${totalUpdated}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Lỗi khi chạy migration:', err);
  process.exit(1);
});