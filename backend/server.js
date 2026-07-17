const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Expense = require("./models/expense");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 3000;

// MongoDB Connection
mongoose
.connect(process.env.MONGO_URI).then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));


// Home Route
app.get("/", (req, res) => {
    res.send("Expense Tracker Backend Running");
});


// Get All Expenses
app.get("/expenses", async (req, res) => {
    try {
        const expenses = await Expense.find();

        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({
            message: err.message,
        });
    }
});


// Add Expense
app.post("/expenses",async(req,res)=>{
    try{
        const expense=new Expense({
            title:req.body.title,
            amount:req.body.amount,
            category:req.body.category,
            date:req.body.date
        });
        const savedExpense=await expense.save();
        res.status(201).json(savedExpense);
    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});

// Update Expense
app.put("/expenses/:id",async(req,res)=>{

    try{
        const updatedExpense=await Expense.findByIdAndUpdate(
            req.params.id,
            {
                title:req.body.title,
                amount:req.body.amount,
                category:req.body.category,
                date:req.body.date
            },
            {
                new:true,
                runValidators:true
            }
        );
        res.json(updatedExpense);

    }catch(err){
        res.status(500).json({
            message:err.message
        });
    }
});


// Delete Expense
app.delete("/expenses/:id", async (req, res) => {

    try {

        await Expense.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Expense Deleted Successfully",
        });

    } catch (err) {

        res.status(500).json({
            message: err.message,
        });

    }

});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});