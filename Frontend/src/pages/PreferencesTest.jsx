import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  generateTest,
  getRecommendation,
  setAnswer,
  nextQuestion,
  previousQuestion,
  loadTestFromStorage,
  clearTest,
  completeTest
} from '../redux/slices/preferencesSlice';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ProductCard from '../components/common/ProductCard';

const PreferencesTest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    questions,
    answers,
    currentQuestion,
    isLoading,
    isGeneratingTest,
    isGettingRecommendation,
    error,
    recommendation,
    testCompleted,
    hasActiveTest
  } = useSelector((state) => state.preferences);

  const [showStartModal, setShowStartModal] = useState(false);
  const [userPrompt, setUserPrompt] = useState('');
  const [showRecommendation, setShowRecommendation] = useState(false);

  useEffect(() => {
    // Cargar test desde localStorage si existe
    dispatch(loadTestFromStorage());
    
    // Si no hay test activo, mostrar modal de inicio
    if (!hasActiveTest && questions.length === 0) {
      setShowStartModal(true);
    }
  }, [dispatch]);

  useEffect(() => {
    // Cuando se completa el test y se obtiene recomendación
    if (testCompleted && recommendation) {
      setShowRecommendation(true);
    }
  }, [testCompleted, recommendation]);

  const handleStartTest = async () => {
    setShowStartModal(false);
    await dispatch(generateTest(userPrompt));
  };

  const handleAnswerSelect = (answer) => {
    dispatch(setAnswer({
      questionIndex: currentQuestion,
      answer: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      dispatch(nextQuestion());
    } else {
      // Última pregunta, obtener recomendación
      dispatch(completeTest());
      dispatch(getRecommendation());
    }
  };

  const handlePrevious = () => {
    dispatch(previousQuestion());
  };

  const handleRestart = () => {
    dispatch(clearTest());
    setShowRecommendation(false);
    setShowStartModal(true);
    setUserPrompt('');
  };

  const handleGoToCatalog = () => {
    dispatch(clearTest());
    navigate('/catalog');
  };

  const calculateProgress = () => {
    if (questions.length === 0) return 0;
    return Math.round(((currentQuestion + 1) / questions.length) * 100);
  };

  const isAnswered = () => {
    return answers[currentQuestion] !== undefined;
  };

  if (isLoading && !questions.length) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-['Montserrat']">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6b2c2c] mx-auto mb-4"></div>
          <p className="text-[#6b2c2c]">
            {isGeneratingTest ? 'Generando tu test personalizado...' : 'Cargando...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-['Montserrat']">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#6b2c2c] mb-2">
            Test de Preferencias
          </h1>
          <p className="text-[#6b2c2c] opacity-80">
            Responde las siguientes preguntas para recibir una recomendación personalizada
          </p>
        </div>

        {/* Progress Bar */}
        {questions.length > 0 && !testCompleted && (
          <div className="mb-8">
            <div className="flex justify-between text-sm text-[#6b2c2c] mb-2">
              <span>Pregunta {currentQuestion + 1} de {questions.length}</span>
              <span>{calculateProgress()}%</span>
            </div>
            <div className="w-full bg-[#f5e6d3] rounded-full h-2">
              <div
                className="bg-[#6b2c2c] h-2 rounded-full transition-all duration-300"
                style={{ width: `${calculateProgress()}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-[#f5e6d3] border border-[#b17b6b] text-[#6b2c2c] px-4 py-3 rounded">
            <p>{error}</p>
          </div>
        )}

        {/* Question and Answers */}
        {questions.length > 0 && !testCompleted && !isGettingRecommendation && (
          <div className="bg-white rounded-lg shadow-md border border-[#b17b6b] p-8">
            <h2 className="text-xl font-semibold text-[#6b2c2c] mb-6">
              {questions[currentQuestion]?.question}
            </h2>

            <div className="space-y-4 mb-8">
              {questions[currentQuestion]?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option.value)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion] === option.value
                      ? 'border-[#6b2c2c] bg-[#f5e6d3]'
                      : 'border-[#b17b6b] hover:border-[#6b2c2c] hover:bg-[#fef9f3]'
                  }`}
                >
                  <div className="font-medium text-[#6b2c2c]">{option.label}</div>
                  {option.description && (
                    <div className="text-sm text-[#6b2c2c] opacity-70 mt-1">
                      {option.description}
                    </div>
                  )}
                </button>
              ))}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                variant="secondary"
              >
                ← Regresar
              </Button>

              <Button
                onClick={handleNext}
                disabled={!isAnswered()}
              >
                {currentQuestion === questions.length - 1 ? 'Finalizar' : 'Siguiente →'}
              </Button>
            </div>
          </div>
        )}

        {/* Loading Recommendation */}
        {isGettingRecommendation && (
          <div className="bg-white rounded-lg shadow-md border border-[#b17b6b] p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#6b2c2c] mx-auto mb-4"></div>
            <p className="text-[#6b2c2c] text-lg">
              Analizando tus preferencias y preparando tu recomendación...
            </p>
          </div>
        )}
      </div>

      {/* Start Test Modal */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Comenzar Test de Preferencias"
      >
        <div className="space-y-4">
          <p className="text-[#6b2c2c] opacity-80">
            ¿Tienes alguna preferencia específica que quieras compartir? (Opcional)
          </p>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder="Por ejemplo: Me gustan los postres con chocolate, prefiero sabores dulces..."
            className="resize-none w-[410px] px-4 py-2 border-2 border-[#b17b6b] rounded-lg focus:ring-2 focus:ring-[#6b2c2c] focus:border-[#6b2c2c] text-[#6b2c2c]"
            rows="4"
          />
          <div className="flex gap-4">
            <Button
              onClick={handleStartTest}
              className="flex-1"
            >
              Comenzar Test
            </Button>
          </div>
        </div>
      </Modal>

      {/* Recommendation Modal */}
      <Modal
        isOpen={showRecommendation}
        onClose={() => setShowRecommendation(false)}
        title="Tu Recomendación Personalizada"
      >
        <div className="space-y-6">
          {recommendation && (
            <>
              <div className="text-center">
                <p className="text-[#6b2c2c] mb-4">
                  {recommendation.message || 'Basado en tus respuestas, te recomendamos:'}
                </p>
              </div>

              {recommendation.product && (
                <div className="flex justify-center">
                  <ProductCard product={recommendation.product} />
                </div>
              )}

              {recommendation.explanation && (
                <div className="bg-[#f5e6d3] border border-[#b17b6b] p-4 rounded-lg">
                  <h3 className="font-semibold text-[#6b2c2c] mb-2">
                    ¿Por qué esta recomendación?
                  </h3>
                  <p className="text-[#6b2c2c] opacity-80">{recommendation.explanation}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleGoToCatalog}
                  variant="primary"
                  className="flex-1"
                >
                  Ver Catálogo Completo
                </Button>
                <Button
                  onClick={handleRestart}
                  variant="secondary"
                  className="flex-1"
                >
                  Hacer Nuevo Test
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default PreferencesTest;
