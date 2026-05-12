const express = require("express")
const morgan = require("morgan")
const dotenv = require("dotenv")
const mongoose = require("mongoose")


dotenv.config()

const app = express()       

app.use(express.json())
app.use(morgan("dev"))

const PORT = process.env.PORT;
const dbUrl = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

const providerSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    phoneNumber: String,
    skillCategory: String,
    gender: String,
    address: String,
    isVerified: Boolean
});

const Provider = mongoose.model("Provider", providerSchema);


app.post("/providers", async (req, res) => {
    const { fullName, email, phoneNumber, skillCategory, gender, address, isVerified } = req.body;
    try {
        if (!fullName || !email || !phoneNumber || !skillCategory || !gender || !address) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newProvider = new Provider({
            fullName,
            email,
            phoneNumber,
            skillCategory,   
            gender,
            address,
            isVerified: false
        });
        await newProvider.save();
        return res.status(201).json({ message: "Provider added successfully", provider: newProvider });
    } catch (error) {
        if (error.code === 11000) {
            console.error("Error adding provider:", error);
            return res.status(500).json({ message: "Internal Server error" });
        }
        console.error("Error adding provider:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

app.get("/providers", async (req, res) => {
    try {
        const  { skill } = req.query;
        let filter = {};
        if (skill) {
            filter = { skillCategory: skill };
        }
        const providers = await Provider.find(filter);
        return res.status(200).json(providers);
    } catch (error) {
        console.error("Error fetching providers:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

app.get("/providers/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const provider = await Provider.findById(id);
        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        return res.status(200).json(provider);
    } catch (error) {
        console.error("Error fetching provider:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

app.patch("/providers/:id/verify", async (req, res) => {
    const { id } = req.params;
    try {
        const provider = await Provider.findByIdAndUpdate(
            id, { isVerified: true }, { new: true }
        );

        if (!provider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        return res.status(200).json({ message: "Provider verified successfully", provider });
    } catch (error) {
        console.error("Error verifying provider:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

app.patch("/providers/:id", async (req, res) => {
    const { id } = req.params;
    const { fullName, email, phoneNumber, skillCategory, gender, address, isVerified } = req.body;
    try {
        const provider = await Provider.findByIdAndUpdate(
            id,
            { fullName, email, phoneNumber, skillCategory, gender, address, isVerified },
            { new: true }
        );
        if (!updatedProvider) {
            return res.status(404).json({ message: "Provider not found" });
        }
        return res.status(200).json({ message: "Provider updated successfully", provider });
    } catch (error) {
        console.error("Error updating provider:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }
});

app.delete("/providers/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await Provider.findByIdAndDelete(id);
        return res.status(200).json({ message: "Provider deleted successfully" });
    } catch (error) {
        console.error("Error deleting provider:", error);
        return res.status(500).json({ message: "Internal Server error" });
    }      
});

app.listen(PORT, () => {
    connectDB(); 
    console.log(`Server is running on port ${PORT}`);
});