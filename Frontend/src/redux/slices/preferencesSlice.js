import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import geminiService from '../../services/api/geminiService';
import preferencesStorage from '../../services/preferencesStorage';

// Thunks asíncronos
export const generateTest = createAsyncThunk(
  'preferences/generateTest',
  async (userPrompt, { rejectWithValue }) => {
    try {
      const response = await geminiService.generatePreferencesTest(userPrompt);
      return {
        testId: response.testId,
        questions: response.questions,
        userPrompt: userPrompt
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error generando test');
    }
  }
);

export const getRecommendation = createAsyncThunk(
  'preferences/getRecommendation',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { preferences } = getState();
      const testData = {
        testId: preferences.testId,
        userPrompt: preferences.userPrompt,
        questions: preferences.questions,
        answers: preferences.answers
      };
      
      const response = await geminiService.getProductRecommendation(testData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Error obteniendo recomendación');
    }
  }
);

// Nota: Ya no se guarda en base de datos, solo en localStorage

const initialState = {
  testId: null,
  userPrompt: '',
  questions: [],
  answers: {},
  currentQuestion: 0,
  isLoading: false,
  isGeneratingTest: false,
  isGettingRecommendation: false,
  error: null,
  recommendation: null,
  testCompleted: false,
  hasActiveTest: false
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setAnswer: (state, action) => {
      const { questionIndex, answer } = action.payload;
      state.answers[questionIndex] = answer;
      
      // Guardar en localStorage
      preferencesStorage.updateAnswer(questionIndex, answer);
    },
    
    nextQuestion: (state) => {
      if (state.currentQuestion < state.questions.length - 1) {
        state.currentQuestion += 1;
        
        // Actualizar en localStorage
        const testData = preferencesStorage.getTest();
        if (testData) {
          testData.currentQuestion = state.currentQuestion;
          preferencesStorage.saveTest(testData);
        }
      }
    },
    
    previousQuestion: (state) => {
      if (state.currentQuestion > 0) {
        state.currentQuestion -= 1;
        
        // Actualizar en localStorage
        const testData = preferencesStorage.getTest();
        if (testData) {
          testData.currentQuestion = state.currentQuestion;
          preferencesStorage.saveTest(testData);
        }
      }
    },
    
    loadTestFromStorage: (state) => {
      const savedTest = preferencesStorage.getTest();
      if (savedTest && !savedTest.completed) {
        state.testId = savedTest.testId;
        state.userPrompt = savedTest.userPrompt || '';
        state.questions = savedTest.questions || [];
        state.answers = savedTest.answers || {};
        state.currentQuestion = savedTest.currentQuestion || 0;
        state.hasActiveTest = true;
        state.testCompleted = false;
      }
    },
    
    clearTest: (state) => {
      preferencesStorage.clearTest();
      // Limpiar completamente el estado, incluida la recomendación
      Object.assign(state, initialState);
    },
    
    completeTest: (state) => {
      state.testCompleted = true;
      preferencesStorage.markTestAsCompleted();
    },
    
    resetError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Generate Test
      .addCase(generateTest.pending, (state) => {
        state.isGeneratingTest = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateTest.fulfilled, (state, action) => {
        state.isGeneratingTest = false;
        state.isLoading = false;
        state.testId = action.payload.testId;
        state.questions = action.payload.questions;
        state.userPrompt = action.payload.userPrompt;
        state.answers = {};
        state.currentQuestion = 0;
        state.hasActiveTest = true;
        state.testCompleted = false;
        state.recommendation = null; // Limpiar recomendación anterior
        
        // Guardar en localStorage
        preferencesStorage.saveTest({
          testId: action.payload.testId,
          questions: action.payload.questions,
          userPrompt: action.payload.userPrompt,
          answers: {},
          currentQuestion: 0,
          completed: false
        });
      })
      .addCase(generateTest.rejected, (state, action) => {
        state.isGeneratingTest = false;
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Get Recommendation
      .addCase(getRecommendation.pending, (state) => {
        state.isGettingRecommendation = true;
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRecommendation.fulfilled, (state, action) => {
        state.isGettingRecommendation = false;
        state.isLoading = false;
        state.recommendation = action.payload;
        console.log('✅ Recomendación recibida UNA VEZ:', action.payload);
      })
      .addCase(getRecommendation.rejected, (state, action) => {
        state.isGettingRecommendation = false;
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setAnswer,
  nextQuestion,
  previousQuestion,
  loadTestFromStorage,
  clearTest,
  completeTest,
  resetError
} = preferencesSlice.actions;

export default preferencesSlice.reducer;
