const express = require('express');
const app = express();
const { addIncome, updateIncome, deleteIncome,fetchIncomeData,fetchIncomeDetails,fetchTotalIncome,fetchIncomeCount,getMaxIncome,getMinIncome, fetchIncomeBetweenDates} = require('../providers/incomeProvider');

const addIncomeController = async (req, res) => {
    const { income_amount, income_description, income_date } = req.body;
    const userId = req.session.user.userId;
  
    try {
      const incomeId = await addIncome(income_amount, income_description, userId, income_date);
      res.redirect('/income');
    } catch (error) {
      console.error('Error adding income:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  };
  

  const updateIncomeController = async (req, res) => {
    const { income_amount, income_description, income_date } = req.body;
    const userId = req.session.user.userId;
    const incomeId = req.params.incomeId;

    try {
        // Fetch income details before updating
        const existingIncomeDetails = await fetchIncomeDetails(incomeId);

        // Check if the user has permission to update this income
        if (existingIncomeDetails.user_id !== userId) {
            return res.status(403).json({ message: 'Permission denied. You are not authorized to update this income.' });
        }

        // Perform the update
        await updateIncome(incomeId, income_amount, income_description, userId, income_date);
        
        // Redirect the user back to the income page
        res.redirect('/income');
    } catch (error) {
        console.error('Error updating income:', error);
        if (error.message === 'Income not found') {
            res.status(404).json({ message: 'Income not found' });
        } else {
            res.status(500).json({ message: 'Internal Server Error' });
        }
    }
};

  

const deleteIncomeController = async (req, res) => {
  const incomeId = req.params.incomeId;

  try {
    await deleteIncome(incomeId);
    res.json({ message: 'Income deleted successfully' });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



module.exports = {
  addIncomeController,
  updateIncomeController,
  deleteIncomeController,
  fetchIncomeData,
  fetchIncomeDetails,
  fetchTotalIncome,
  fetchIncomeCount,
  getMaxIncome,
  getMinIncome,
  fetchIncomeBetweenDates,

};
