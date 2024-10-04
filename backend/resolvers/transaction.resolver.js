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
