import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        const user = await context.getUser();
        if (!user) throw new Error("Unauthorized");
        const transactions = await Transaction.find({ userId: user._id });
        return transactions;
      } catch (error) {
        console.error("Error getting transactions: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    transaction: async (_, { transactionId }) => {
      try {
        const transaction = await Transaction.findById(transactionId);
        return transaction;
      } catch (error) {
        console.error("Error getting transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    categoryStatistics: async (_, __, context) => {
      if (!context.getUser()) throw new Error("Unauthorized");
      const userId = context.getUser()._id;
      const transactions = await Transaction.find({ userId });
      const categoryMap = {}; // categoryMap = { expense: 125, investment: 100, saving: 50 }
      transactions.forEach((tran) => {
        if (!categoryMap[tran.category]) {
          categoryMap[tran.category] = 0;
        }
        categoryMap[tran.category] += tran.amount;
      });
      return Object.entries(categoryMap).map(([category, amount]) => ({
        category,
        totalAmount: amount,
      }));
      //// return [ { category: "expense", totalAmount: 125 }, { category: "investment", totalAmount: 100 }, { category: "saving", totalAmount: 50 }
    },
  },
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = new Transaction({
          ...input,
          userId: context.getUser()._id,
        });
        await newTransaction.save();
        return newTransaction;
      } catch (error) {
        console.error("Error creating transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          { ...input },
          { new: true }
        );
        return updatedTransaction;
      } catch (error) {
        console.error("Error updating transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deleteTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deleteTransaction;
      } catch (error) {
        console.error("Error updating transaction: ", error);
        throw new Error(error.message || "Internal Server Error");
      }
    },
  },
};
export default transactionResolver;
