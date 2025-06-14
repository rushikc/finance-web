import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Expense, TagMap} from "../api/Types";
import {FinanceIndexDB} from "../api/FinanceIndexDB";


interface InitialState {
  expenseList: Expense[],
  expense: Expense | null,
  tagList: TagMap[],
  isAppLoading: boolean,
  isTagModal: boolean,
}

const initialState: InitialState = {
  expenseList: [],
  expense: null,
  tagList: [],
  isAppLoading: true,
  isTagModal: false
}


export const expenseSlice = createSlice({
  name: 'expense',
  initialState: initialState,

  reducers: {

    setExpenseList: (state, action: PayloadAction<Expense[]>) => {
      state.expenseList = action.payload;
    },

    setTagExpense: (state, action: PayloadAction<Expense>) => {
      state.expense = action.payload;
      state.isTagModal = true;
    },

    addTagExpense: (state, action: PayloadAction<Expense>) => {
      state.expense = action.payload;
      state.isTagModal = true;
    },

    setTagMap: (state, action: PayloadAction<TagMap>) => {
      const tagObj = action.payload;
      const tagIndex = state.tagList.findIndex(t => t.vendor == tagObj.vendor);

      if (tagIndex > -1) {
        state.tagList[tagIndex].tag = tagObj.tag;
      } else {
        state.tagList.push(tagObj)
      }

      void FinanceIndexDB.addTagMap(tagObj);

    },

    updateExpense: (state, action: PayloadAction<Expense>) => {
      const expense = action.payload;
      const expenseIndex = state.expenseList.findIndex(t => t.mailId == expense.mailId);

      if (expenseIndex > -1) {
        state.expenseList[expenseIndex].tag = expense.tag;
      } else {
        state.expenseList.push(expense)
      }
    },

    hideTagExpense: (state) => {
      state.isTagModal = false;
    },

    setExpenseAndTag: (state, action: PayloadAction<{ expenseList: Expense[], tagList: TagMap[] }>) => {
      state.expenseList = action.payload.expenseList;
      state.tagList = action.payload.tagList;
      state.isAppLoading = false;
    }
  }
})
