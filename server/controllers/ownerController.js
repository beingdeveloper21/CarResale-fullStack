import imagekit from "../configs/imageKit.js";
import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";

// ✅ CHANGE ROLE
export const changeRoleToOwner = async (req, res) => {
  try {
    const userId = req.user._id;

    await User.findByIdAndUpdate(userId, { role: "owner" });

    res.json({
      success: true,
      message: "You are now an owner",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// // ✅ ADD CAR
// export const addCar = async (req, res) => {
//   try {
//     const { _id, role } = req.user;

//     if (role !== "owner") {
//       return res.status(403).json({
//         success: false,
//         message: "Only owners can add cars",
//       });
//     }

//     const car = JSON.parse(req.body.carData);
//     const imageFile = req.file;

//     if (!imageFile) {
//       return res.json({
//         success: false,
//         message: "Image is required",
//       });
//     }

//     // convert numbers
//     ["year", "price", "mileage", "seating_capacity"].forEach((field) => {
//       if (car[field]) car[field] = Number(car[field]);
//     });

//     // upload image
//     const buffer = fs.readFileSync(imageFile.path);

//     const uploaded = await imagekit.upload({
//       file: buffer,
//       fileName: imageFile.originalname,
//       folder: "/cars",
//     });

//     const imageUrl = imagekit.url({
//       path: uploaded.filePath,
//       transformation: [
//         { width: "1280" },
//         { quality: "auto" },
//         { format: "webp" },
//       ],
//     });

//     await Car.create({
//       ...car,
//       owner: _id,
//       image: imageUrl,
//     });

//     res.json({
//       success: true,
//       message: "Car added successfully",
//     });
//   } catch (error) {
//     console.log("ADD CAR ERROR:", error.message);
//     res.json({ success: false, message: error.message });
//   }
// };
export const addCar = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners can add cars"
      });
    }

    const car = JSON.parse(req.body.carData);
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image is required"
      });
    }

    // ✅ FIX: save proper public path
    const imageUrl = `/uploads/${imageFile.filename}`;

    const newCar = await Car.create({
      ...car,
      owner: req.user._id,
      image: imageUrl   // ✅ FIXED
    });

    res.json({
      success: true,
      message: "Car added successfully"
    });

  } catch (error) {
    console.log("ADD CAR ERROR:", error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET OWNER CARS
export const getOwnerCars = async (req, res) => {
  try {
    const cars = await Car.find({ owner: req.user._id });
    res.json({ success: true, cars });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ TOGGLE CAR
export const toggleCarAvailability = async (req, res) => {
  try {
    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (!car || car.owner.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    car.isAvailable = !car.isAvailable;
    await car.save();

    res.json({
      success: true,
      message: "Car updated",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ DELETE CAR
export const deleteCar = async (req, res) => {
  try {
    const { carId } = req.body;

    const car = await Car.findById(carId);

    if (!car || car.owner.toString() !== req.user._id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }

    await Car.findByIdAndDelete(carId);

    res.json({
      success: true,
      message: "Car deleted",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ DASHBOARD (FIXED KEYS)
// export const getDashboardData = async (req, res) => {
//   try {
//     const { _id, role } = req.user;

//     if (role !== "owner") {
//       return res.status(403).json({
//         success: false,
//         message: "Only owners allowed",
//       });
//     }

//     const cars = await Car.find({ owner: _id });

//     const bookings = await Booking.find({ owner: _id })
//       .populate("car")
//       .sort({ createdAt: -1 });

//     const pending = bookings.filter(b => b.status === "pending");
//     const accepted = bookings.filter(b => b.status === "accepted");

//     const revenue = accepted.reduce(
//       (acc, b) => acc + (b.offerPrice || b.price || 0),
//       0
//     );

//     res.json({
//       success: true,
//       dashboardData: {
//         totalCars: cars.length,
//         totalInquiries: bookings.length,
//         pendingInquiries: pending.length,
//         acceptedInquiries: accepted.length,
//         recentInquiries: bookings.slice(0, 3),
//         monthlyRevenue: revenue,
//       },
//     });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };
export const getDashboardData = async (req, res) => {
  try {
    const { _id, role } = req.user;

    if (role !== "owner") {
      return res.status(403).json({
        success: false,
        message: "Only owners allowed",
      });
    }

    // ✅ ALL OWNER CARS
    const cars = await Car.find({ owner: _id });

    // ✅ BOOKINGS (REAL SOURCE OF SALES)
    const bookings = await Booking.find({ owner: _id })
      .populate("car")
      .sort({ createdAt: -1 });

    // ✅ ONLY SUCCESSFUL SALES
    const successfulSales = bookings.filter(
      (b) => b.paymentStatus === "paid" || b.status === "accepted"
    );

    // ✅ UNIQUE SOLD CARS (avoid duplicates)
    const soldCarIds = new Set(
      successfulSales.map((b) => b.car?._id?.toString())
    );

    const totalSoldCars = soldCarIds.size;

    // ✅ TOTAL REVENUE (safe)
    const totalRevenue = successfulSales.reduce((acc, b) => {
      const price = Number(b.price || b.offerPrice || 0);
      return acc + price;
    }, 0);

    // ✅ RECENT SALES (last 5)
    const recentSales = successfulSales.slice(0, 5);

    res.json({
      success: true,
      dashboardData: {
        totalCars: cars.length,
        totalSoldCars,
        totalRevenue,
        recentSales,
      },
    });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ UPDATE USER IMAGE
export const updateUserImage = async (req, res) => {
  try {
    const imageFile = req.file;

    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image required",
      });
    }

    const buffer = fs.readFileSync(imageFile.path);

    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: imageFile.originalname,
      folder: "/users",
    });

    const imageUrl = imagekit.url({
      path: uploaded.filePath,
      transformation: [{ width: "400" }],
    });

    await User.findByIdAndUpdate(req.user._id, { image: imageUrl });

    res.json({
      success: true,
      message: "Image updated",
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};