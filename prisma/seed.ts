import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // --- Wipe in dependency order ---
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cateringRequest.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.topping.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.user.deleteMany();

  // --- Testimonials (sample) ---
  const testimonials = [
    { name: "Linh T.", role: "Wedding · 250 guests", rating: 5, text: "Gõ Seattle absolutely made our wedding. Every dish tasted like home, and the buffet looked stunning." },
    { name: "Marcus R.", role: "Corporate lunch · 40", rating: 5, text: "Our team still talks about the bánh mì spread. Professional, on time, and incredibly delicious." },
    { name: "Hằng N.", role: "Family gathering · 30", rating: 5, text: "Honest, traditional flavors. The phở and gỏi cuốn were the best I've had outside Vietnam." },
  ];
  for (let i = 0; i < testimonials.length; i++) {
    await prisma.testimonial.create({ data: { ...testimonials[i], displayOrder: i } });
  }

  // --- Site settings (singleton) ---
  const defaultHours = [
    { day: "Mon", hours: "10:00 AM – 8:00 PM" },
    { day: "Tue", hours: "10:00 AM – 8:00 PM" },
    { day: "Wed", hours: "10:00 AM – 8:00 PM" },
    { day: "Thu", hours: "10:00 AM – 8:00 PM" },
    { day: "Fri", hours: "10:00 AM – 9:00 PM" },
    { day: "Sat", hours: "10:00 AM – 9:00 PM" },
    { day: "Sun", hours: "11:00 AM – 7:00 PM" },
  ];
  await prisma.settings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      name: "Gõ Seattle Catering",
      sloganEn: "Cooking with love provides food for the soul",
      sloganVn: "Hương Vị Việt — Taste of Vietnam",
      phone: "(206) 555-0100",
      email: "hello@goseattlecatering.com",
      address: "Seattle, WA",
      website: "goseattlecatering.com",
      facebook: "https://facebook.com/Gõ-Seattle-Catering",
      hours: JSON.stringify(defaultHours),
    },
  });

  // --- Admin user ---
  const adminHash = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@goseattlecatering.com",
      passwordHash: adminHash,
      name: "Gõ Seattle Admin",
      role: "ADMIN",
    },
  });

  const demoHash = await bcrypt.hash("demo123", 10);
  await prisma.user.create({
    data: {
      email: "demo@example.com",
      passwordHash: demoHash,
      name: "Demo Customer",
      phone: "(206) 555-0100",
      role: "CUSTOMER",
    },
  });

  // --- Toppings (shared for drinks) ---
  const toppings = [
    "Tapioca", "Strawberry Popping", "Mango Popping", "Lychee Popping",
    "Grass Jelly", "Mango Jelly", "Rainbow Jelly", "Lychee Coconut Jelly", "Red Beans",
  ];
  for (const t of toppings) {
    await prisma.topping.create({ data: { name: t, price: 0.75 } });
  }
  await prisma.topping.create({ data: { name: "Crystal Boba", price: 1.0 } });

  // --- Categories + menu items ---
  type Item = { code?: string; nameEn: string; nameVn?: string; price: number; description?: string };

  const data: { slug: string; nameEn: string; nameVn: string; order: number; items: Item[] }[] = [
    {
      slug: "rice-noodles-rolls",
      nameEn: "Rice, Noodles & Spring Rolls",
      nameVn: "Gỏi Cuốn · Cơm · Bún",
      order: 1,
      items: [
        { code: "F1", nameEn: "Fresh Shrimp Spring Roll", nameVn: "Gỏi Cuốn", price: 7.85 },
        { code: "F2", nameEn: "Fresh Spring Rolls with Tofu", nameVn: "Gỏi Cuốn Đậu Hủ", price: 7.85 },
        { code: "F3", nameEn: "Deep Fried Egg Rolls", nameVn: "Chả Giò", price: 7.85 },
        { code: "F4", nameEn: "Pork Chop Steamed Rice", nameVn: "Cơm Sườn Heo", price: 18.0 },
        { code: "F5", nameEn: "Tofu & Veggies Rice", nameVn: "Cơm Chay Đậu Hũ", price: 17.0 },
        { code: "F6", nameEn: "Grilled Chicken Steamed Rice", nameVn: "Cơm Gà Nướng", price: 17.0 },
        { code: "F7", nameEn: "Grilled Beef Short Rib Steamed Rice", nameVn: "Cơm Sườn Bò Nướng", price: 19.0 },
        { code: "F8", nameEn: "Gõ Special Noodles Bowl", nameVn: "Bún Đặc Biệt", price: 22.0 },
        { code: "F9", nameEn: "Grilled Beef Lá Lốt Vermicelli", nameVn: "Bún Thịt Bò Lá Lốt", price: 18.0 },
        { code: "F10", nameEn: "Grilled Pork & Egg Rolls Vermicelli", nameVn: "Bún Thịt Nướng Chả Giò", price: 18.0 },
        { code: "F11", nameEn: "Grilled Pork Vermicelli", nameVn: "Bún Thịt Nướng", price: 17.0 },
        { code: "F12", nameEn: "Grilled Chicken Vermicelli", nameVn: "Bún Gà Nướng", price: 17.0 },
        { code: "F13", nameEn: "Deep Fried Egg Rolls Vermicelli", nameVn: "Bún Chả Giò", price: 17.0 },
        { code: "F14", nameEn: "Seafood Chow Mein", nameVn: "Mì Xào Hải Sản", price: 17.0 },
        { code: "F15", nameEn: "House Fried Rice", nameVn: "Cơm Chiên", price: 17.0 },
        { code: "F16", nameEn: "Vegetarian Vermicelli", nameVn: "Bún Chay", price: 17.0 },
      ],
    },
    {
      slug: "banh-mi",
      nameEn: "Vietnamese Sandwiches",
      nameVn: "Bánh Mì",
      order: 2,
      items: [
        { code: "B1", nameEn: "Grilled Pork", nameVn: "Bánh Mì Thịt Nướng", price: 8.95 },
        { code: "B2", nameEn: "Grilled Chicken", nameVn: "Bánh Mì Gà Nướng", price: 8.95 },
        { code: "B3", nameEn: "Vegetarian", nameVn: "Bánh Mì Chay", price: 8.95 },
        { code: "B4", nameEn: "BBQ Pork", nameVn: "Bánh Mì Xá Xíu", price: 8.95 },
        { code: "B5", nameEn: "Caramelized Pork Belly", nameVn: "Bánh Mì Thịt Rim", price: 9.95 },
        { code: "B6", nameEn: "Fried Fish Cake", nameVn: "Bánh Mì Chả Cá", price: 9.95 },
        { code: "B7", nameEn: "Pork Roll", nameVn: "Bánh Mì Chả Lụa", price: 8.95 },
        { code: "B8", nameEn: "Pork Roll & Egg", nameVn: "Bánh Mì Chả Lụa & Trứng", price: 8.95 },
        { code: "B9", nameEn: "Shredded Pork Skin", nameVn: "Bánh Mì Bì", price: 8.95 },
        { code: "B10", nameEn: "Stew Pork Offal", nameVn: "Bánh Mì Phá Lấu", price: 9.95 },
        { code: "B11", nameEn: "Sardines", nameVn: "Bánh Mì Cá Mòi", price: 9.95 },
        { code: "B12", nameEn: "Roasted Pork", nameVn: "Bánh Mì Heo Quay", price: 9.95 },
        { code: "B13", nameEn: "Lemongrass Beef", nameVn: "Bánh Mì Bò Xào Sả", price: 9.95 },
        { code: "B14", nameEn: "Special", nameVn: "Bánh Mì Đặc Biệt", price: 9.95, description: "Jambon, Pork Roll, BBQ Pork & Pork Paste" },
        { code: "B15", nameEn: "Pork Meatball in Tomato Sauce", nameVn: "Bánh Mì Xíu Mại", price: 9.95 },
      ],
    },
    {
      slug: "ice-juice",
      nameEn: "Fresh Ice Juice",
      nameVn: "Nước Trái Cây Tươi",
      order: 3,
      items: [
        { code: "J1", nameEn: "My Tho Press Sugarcane Juice", nameVn: "Nước Mía Miền Tây", price: 8.0 },
        { code: "J2", nameEn: "Fresh Squeezed Orange Juice", nameVn: "Nước Cam Vắt", price: 7.5 },
        { code: "J3", nameEn: "Passion Fruits", nameVn: "Nước Chanh Dây", price: 7.0 },
        { code: "J4", nameEn: "Strawberry Lemonade", nameVn: "Đá Chanh Dâu", price: 7.0 },
        { code: "J5", nameEn: "Thai Ice Tea", nameVn: "Trà Thái", price: 7.0 },
        { code: "J7", nameEn: "Fresh Pennywort", nameVn: "Nước Rau Má", price: 8.0 },
        { code: "J8", nameEn: "Fresh Pennywort w/ Mung Bean", nameVn: "Rau Má Đậu Xanh", price: 8.5 },
        { code: "J9", nameEn: "Peach Tea", nameVn: "Trà Đào", price: 7.0 },
      ],
    },
    {
      slug: "milk-tea",
      nameEn: "Milk Tea",
      nameVn: "Trà Sữa",
      order: 4,
      items: [
        { code: "M1", nameEn: "Black Milk Tea", nameVn: "Trà Sữa", price: 7.0 },
        { code: "M2", nameEn: "Jasmine Milk Tea", nameVn: "Trà Sữa Lài", price: 7.0 },
        { code: "M3", nameEn: "Thai Green Milk Tea", nameVn: "Trà Sữa Thái Xanh", price: 7.0 },
        { code: "M4", nameEn: "Peach Milk Tea", nameVn: "Trà Sữa Đào", price: 7.0 },
        { code: "M5", nameEn: "Taro Milk Tea", nameVn: "Trà Sữa Khoai Môn", price: 7.0 },
        { code: "M6", nameEn: "Coffee Milk Tea", nameVn: "Trà Sữa Cafe", price: 7.0 },
        { code: "M7", nameEn: "Thai Red Milk Tea", nameVn: "Trà Sữa Thái Đỏ", price: 7.0 },
        { code: "M9", nameEn: "Honeydew Milk Tea", nameVn: "Trà Sữa Dưa Lưới", price: 7.0 },
      ],
    },
    {
      slug: "coffee",
      nameEn: "Coffee Series",
      nameVn: "Cà Phê",
      order: 5,
      items: [
        { code: "C1", nameEn: "Vietnamese Iced Coffee", nameVn: "Cà Phê Sữa Đá", price: 7.0 },
        { code: "C2", nameEn: "Vietnamese Black Coffee", nameVn: "Cà Phê Đen Đá", price: 7.0 },
        { code: "C3", nameEn: "Vietnamese Coffee & Ice Cream", nameVn: "Cà Phê Kem", price: 8.5 },
        { code: "C4", nameEn: "Coffee Blended", nameVn: "Cà Phê Đá Xay", price: 7.5 },
      ],
    },
    {
      slug: "smoothies",
      nameEn: "Fresh Fruits Smoothie",
      nameVn: "Sinh Tố Trái Cây Tươi",
      order: 6,
      items: [
        { code: "S1", nameEn: "Fresh Avocado Smoothie", nameVn: "Sinh Tố Bơ", price: 8.5 },
        { code: "S2", nameEn: "Durian Lover Smoothie", nameVn: "Sinh Tố Sầu Riêng", price: 8.5 },
        { code: "S3", nameEn: "Strawberry Smoothie", nameVn: "Sinh Tố Dâu", price: 7.5 },
        { code: "S4", nameEn: "Mango Favorite Smoothie", nameVn: "Sinh Tố Xoài", price: 7.5 },
        { code: "S5", nameEn: "Soursop Smoothie", nameVn: "Sinh Tố Mãng Cầu", price: 7.5 },
        { code: "S6", nameEn: "Strawberry Banana Smoothie", nameVn: "Sinh Tố Dâu Chuối", price: 7.5 },
        { code: "S7", nameEn: "Taro Smoothie", nameVn: "Sinh Tố Khoai Môn", price: 7.5 },
        { code: "S8", nameEn: "Passion Fruit Smoothie", nameVn: "Sinh Tố Chanh Dây", price: 7.5 },
        { code: "S9", nameEn: "Matcha Smoothie", nameVn: "Sinh Tố Trà Xanh", price: 7.5 },
        { code: "S10", nameEn: "Coconut Smoothie", nameVn: "Sinh Tố Dừa", price: 7.5 },
        { code: "S11", nameEn: "Avocado & Coffee Smoothie", nameVn: "Sinh Tố Bơ Cafe", price: 8.75 },
      ],
    },
  ];

  // Map item codes -> professional food photos
  // We share photos across similar items in the same category
  const banhMi = "/images/food/banh-mi.jpg";
  const banhMiTray = "/images/food/banh-mi-tray.jpg";
  const pho = "/images/food/pho.jpg";
  const springRolls = "/images/food/spring-rolls.jpg";
  const caPhe = "/images/food/ca-phe.jpg";
  const caPheDa = "/images/food/ca-phe-da.jpg";
  const smoothies = "/images/food/smoothies-3glass.jpg";
  const mangoSmoothie = "/images/food/mango-smoothie.jpg";

  const itemImages: Record<string, string> = {
    // Bánh Mì — alternate single + tray for visual variety
    B1: banhMi, B2: banhMi, B3: banhMi, B4: banhMiTray, B5: banhMiTray,
    B6: banhMi, B7: banhMi, B8: banhMiTray, B9: banhMi, B10: banhMiTray,
    B11: banhMi, B12: banhMiTray, B13: banhMi, B14: banhMiTray, B15: banhMi,
    // Mains — spring rolls for goi cuon, pho for rice/bun bowls
    F1: springRolls, F2: springRolls, F3: springRolls,
    F4: pho, F5: pho, F6: pho, F7: pho, F8: pho, F9: pho,
    F10: pho, F11: pho, F12: pho, F13: pho, F14: pho, F15: pho, F16: pho,
    // Drinks (juices)
    J1: mangoSmoothie, J2: mangoSmoothie, J3: mangoSmoothie, J4: mangoSmoothie,
    J5: caPheDa, J7: mangoSmoothie, J8: mangoSmoothie, J9: caPheDa,
    // Milk tea
    M1: caPheDa, M2: caPheDa, M3: caPheDa, M4: caPheDa,
    M5: caPheDa, M6: caPhe, M7: caPheDa, M9: caPheDa,
    // Coffee
    C1: caPhe, C2: caPhe, C3: caPhe, C4: caPheDa,
    // Smoothies
    S1: smoothies, S2: smoothies, S3: smoothies, S4: mangoSmoothie, S5: smoothies,
    S6: smoothies, S7: smoothies, S8: mangoSmoothie, S9: smoothies,
    S10: smoothies, S11: smoothies,
  };

  // Items to feature on the home page by default (admin can change later)
  const FEATURED_CODES = new Set(["B1", "B14", "F1", "F4", "C1", "S4"]);

  for (const cat of data) {
    const category = await prisma.category.create({
      data: {
        slug: cat.slug,
        nameEn: cat.nameEn,
        nameVn: cat.nameVn,
        displayOrder: cat.order,
      },
    });
    let i = 0;
    for (const item of cat.items) {
      const img = item.code ? itemImages[item.code] : undefined;
      await prisma.menuItem.create({
        data: {
          categoryId: category.id,
          code: item.code,
          nameEn: item.nameEn,
          nameVn: item.nameVn,
          description: item.description,
          basePrice: item.price,
          image: img,
          isFeatured: item.code ? FEATURED_CODES.has(item.code) : false,
          displayOrder: i++,
        },
      });
    }
  }

  const counts = await Promise.all([
    prisma.category.count(),
    prisma.menuItem.count(),
    prisma.topping.count(),
    prisma.user.count(),
  ]);
  console.log(`✅ Seeded: ${counts[0]} categories, ${counts[1]} items, ${counts[2]} toppings, ${counts[3]} users`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
