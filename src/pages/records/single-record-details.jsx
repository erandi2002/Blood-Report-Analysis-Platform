import React, { useState } from "react";
import {
  IconChevronRight,
  IconFileUpload,
  IconProgress,
} from "@tabler/icons-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useStateContext } from "../../context/index";
import ReactMarkdown from "react-markdown";
import FileUploadModal from "./components/file-upload-modal";
import RecordDetailsHeader from "./components/record-details-header";
import { GoogleGenerativeAI } from "@google/generative-ai";

const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

function SingleRecordDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [processing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(
    state.analysisResult || "",
  );
  const [filename, setFilename] = useState("");
  const [filetype, setFileType] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { updateRecord } = useStateContext();

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log("Selected file:", file);
    setFileType(file.type);
    setFilename(file.name);
    setFile(file);
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async () => {
    setUploading(true);
    setUploadSuccess(false);

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    try {
      const base64Data = await readFileAsBase64(file);

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: filetype,
          },
        },
      ];

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `You are a highly skilled medical assistant specializing in interpreting blood test reports for patients.
                    Analyze the attached blood report image and explain the results clearly and simply.                    
                    Follow this format:
                    1. **Overview**  
                    Briefly describe the patient's overall blood health in 2-3 easy-to-understand sentences.

                    2. **Key Highlights**  
                    List any values that are outside the normal range (e.g., low hemoglobin, high WBC). Keep it clear and short.

                    3. **Report Stage**  
                    Uploaded blood report status. (e.g. normal, abnormal,critical).

                    4. **Interpretation**  
                    Explain what those values might mean in everyday language. Avoid using difficult medical terms. Keep sentences short and clear.

                    5. **Recommendations**  
                    Suggest simple next steps (like repeating the test, improving diet, seeing a doctor). Keep it calm and supportive.
                    **Tone:** Use friendly, clear, and reassuring language. Avoid technical or scary words.  
                    Write in short paragraphs so it's easy to read.  
                    If everything looks normal, clearly say that the report is healthy and no action is needed.`;

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const text = response.text();
      setAnalysisResult(text);
      const updatedRecord = await updateRecord({
        documentID: state.id,
        analysisResult: text,
        kanbanRecords: "",
      });
      setUploadSuccess(true);
      setIsModalOpen(false); 
      setFilename("");
      setFile(null);
      setFileType("");
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const processTreatmentPlan = async () => {
    setIsProcessing(true);

    const genAI = new GoogleGenerativeAI(geminiApiKey);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `You are a helpful AI health assistant analyzing this blood test interpretation:
                ${analysisResult}
                From this, create a set of practical follow-up suggestions for the patient. Organize them into 3 sections:
                 - "Recommended Actions" — steps the patient should consider doing soon (e.g., rechecking tests, consulting a doctor, changing diet).
                 - "Currently Following" — any self-care actions the patient might already be doing (e.g., drinking more water, researching foods).
                 - "Completed" — anything the patient has likely already done (e.g., already scheduled a consultation or made a change).
                Each suggestion should be clear, short, and helpful for the patient. Focus on health tracking, lifestyle adjustments, or talking to a doctor.
                 Please output the result in this exact format (no explanation, no quotes):
                {
                  "columns": [
                  { "id": "todo", "title": "Recommended Actions" },
                  { "id": "doing", "title": "Currently Following" },
                  { "id": "done", "title": "Completed" }
                  ],
                  "tasks": [
                  { "id": "1", "columnId": "todo", "content": "Schedule blood test in 3 weeks" },
                  { "id": "2", "columnId": "todo", "content": "Discuss high cholesterol with a doctor" },
                  { "id": "3", "columnId": "doing", "content": "Limiting sugar intake daily" },
                  { "id": "4", "columnId": "doing", "content": "Taking Vitamin B12 supplement" },
                  { "id": "5", "columnId": "done", "content": "Started food journal to track diet" }
                  ]
                } `;


    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const parsedResponse = JSON.parse(text);

    console.log(text);
    console.log(parsedResponse);
    const updatedRecord = await updateRecord({
      documentID: state.id,
      kanbanRecords: text,
    });
    console.log(updatedRecord);
    navigate("/screening-schedules", { state: parsedResponse });
    setIsProcessing(false);
  };

  return (
    <div className="flex flex-wrap gap-[26px]">
      <button
        type="button"
        onClick={handleOpenModal}
        className="mt-6 inline-flex items-center gap-x-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-[#13131a] dark:text-white dark:hover:bg-neutral-800"
      >
        <IconFileUpload />
        Upload Reports
      </button>
      <FileUploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onFileChange={handleFileChange}
        onFileUpload={handleFileUpload}
        uploading={uploading}
        uploadSuccess={uploadSuccess}
        filename={filename}
      />
      <RecordDetailsHeader recordName={state.recordName} />
      <div className="w-full">
        <div className="flex flex-col">
          <div className="-m-1.5 overflow-x-auto">
            <div className="inline-block min-w-full p-1.5 align-middle">
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-[#13131a]">
                <div className="border-b border-gray-200 px-6 py-4 dark:border-neutral-700">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-neutral-200">
                    Personalized Blood Test Interpretation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-neutral-400">
                  Understand your blood results with help from AI
                  </p>
                </div>
                <div className="flex w-full flex-col px-6 py-4 text-white">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Analysis Result
                    </h3>
                    <div className="space-y-2">
                      <ReactMarkdown>{analysisResult}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="mt-5 grid gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={processTreatmentPlan}
                      className="inline-flex items-center gap-x-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
                    >
                      View Treatment plan
                      <IconChevronRight size={20} />
                      {processing && (
                        <IconProgress
                          size={10}
                          className="mr-3 h-5 w-5 animate-spin"
                        />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid gap-3 border-t border-gray-200 px-6 py-4 md:flex md:items-center md:justify-between dark:border-neutral-700">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-neutral-400">
                      <span className="font-semibold text-gray-800 dark:text-neutral-200"></span>{" "}
                    </p>
                  </div>
                  <div>
                    <div className="inline-flex gap-x-2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleRecordDetails;
