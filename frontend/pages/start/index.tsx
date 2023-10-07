import React, { useState, useEffect } from "react";

import type { NextPage } from "next";
import Head from "next/head";

import axios from "axios";
import { Tensor, InferenceSession } from "onnxjs";
import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";

import Address from "../../components/Address";
import ClassifyResult from "../../components/ClassifyResult";
import Footer from "../../components/Footer";
import { useRouter } from "next/router";

import WorldIDWidget from "../../components/WorldIDWidget";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../../utils/ethereum";

import { buildContractCallArgs, generateProof } from "../../utils/snark";
import { computeQuantizedEmbedding } from "../../utils/model";

import metadata from "../../data/unic.json";

import "react-toastify/dist/ReactToastify.css";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const UNIC_CONTRACT_ADDR = "0xAE5bE8fBfeCC7baF3ee368313EcB173E9dab0e73";
const UNIC_CONTRACT_ABI: any = metadata.abi;

const mlModelUrl = "/frontend_model.onnx";

const title = "ZK Face Recognition";
const description =
  "Recognizing faces privately using ZK Snarks and Machine Learning";

// const appHeading = "ZK Face Recognition";
// const appDescription =
//   "In this app, we use ZK Snarks and Machine Learning to recognize a face privately";

const primaryButtonClasses =
  "mt-10  flex items-center justify-center rounded-2xl border border-transparent bg-white px-14  py-4 text-xl font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide";

// const titlePart1 = "Connect with the world effortlessly with";
// const titlePart2 = "Sapien";

const Home: NextPage = () => {
  const router = useRouter();
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [session, setSession] = useState<any>();

  const [account, setAccount] = useState();
  const [unicContract, setUnicContract] = useState<any>();

  const [prediction, setPrediction] = useState<null | number>();
  const [embedding, setEmbedding] = useState<number[]>();
  const [proof, setProof] = useState<any>("0xabcdef");
  const [selectedImage, setSelectedImage] = useState<any>();

  const [image, setImage] = useState(null);

  const [webcam, setWebcam] = useState(false);
  const [validated, setValidated] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const preProcess = async (fileInput: any): Promise<Tensor | null> => {
    let tensorData;
    try {
      if (!fileInput) return null;

      const formData = new FormData();
      formData.append("file", fileInput);

      const response = await axios.post(
        "http://localhost:8000/embeddings",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      tensorData = response.data?.embeddings;
    } catch (e) {
      console.log("preProcess error: ", e);
    }

    const tensor = new Tensor(new Float32Array(512), "float32", [1, 512]);
    (tensor.data as Float32Array).set(tensorData);
    return tensor;
  };

  const runModel = async (
    model: InferenceSession,
    preProcessedData: Tensor
  ): Promise<[Tensor, number]> => {
    const start = new Date();
    try {
      const outputData = await model.run([preProcessedData]);
      const end = new Date();
      const inferenceTime = end.getTime() - start.getTime();
      const output = outputData.values().next().value;
      return [output, inferenceTime];
    } catch (e) {
      console.error(e);
      throw new Error();
    }
  };

  const classify = async (base64Image: any, session: any) => {
    if (!session) return;

    try {
      const result = await fetch(base64Image);
      const blob = await result.blob();

      const file = new File([blob], "filename.jpeg");

      const preProcessedData = await preProcess(file);
      if (!preProcessedData) return;

      let [modelOutput, _] = await runModel(session, preProcessedData);

      var output = modelOutput.data;
      const quantizedEmbedding = computeQuantizedEmbedding(output, 1)[0];

      console.log(quantizedEmbedding.length, quantizedEmbedding);

      //const { proof, publicSignals } = await generateProof(quantizedEmbedding);
      //const maxValue = Math.max(...publicSignals);

      setEmbedding(quantizedEmbedding);
      //setPrediction(maxValue);
      //setProof(proof);

      toast.success(
        "Face classification and proof generation completed successfully"
      );
    } catch (e) {
      console.warn(e);
    }
  };

  // const verifyProof = async (proof: any, publicSignals: any) => {
  //   //@ts-ignore
  //   if (!window?.ethereum || !account) {
  //     toast.error("Please connect your MetaMask wallet");
  //     return;
  //   }

  //   try {
  //     const callArgs = await buildContractCallArgs(proof, publicSignals);
  //     const result = await verifierContract.addUserByFace(...callArgs);

  //     if (result) {
  //       toast.success("User added!");
  //       router.push("/verified");
  //       return;
  //     }
  //     toast.error("Invalid user details!");
  //   } catch (e) {
  //     toast.error("User already registered!");
  //   }
  // };

  const addUser = async () => {
    // @ts-ignore
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask wallet");
      return;
    }

    if (!embedding) {
      toast.error("Please click picture first");
    }

    try {
      const result = await unicContract.registerUser(embedding);
      console.log("result", result);

      await result.wait();

      if (result) {
        toast.success("User added!");

        toast.success("Successfully added User on Chain!");
        return;
      }
      toast.error("Invalid user details!");
    } catch (e) {
      toast.error("User already registered!");
    }
  };

  const onImageChange = async (e: any) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const setupWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) return;

    setupEthereumEventListeners(ethereum);

    const contract = getSignedContract(UNIC_CONTRACT_ADDR, UNIC_CONTRACT_ABI);

    if (!contract) return;

    const currentAccount = await getCurrentAccount();
    setUnicContract(contract);
    setAccount(currentAccount);
  };

  const loadModel = async () => {
    const session = new InferenceSession({ backendHint: "cpu" });
    const url = mlModelUrl;
    await session.loadModel(url);

    setIsModelLoaded(true);
    setSession(session);
  };

  useEffect(() => {
    setupWallet();
    loadModel();
  }, []);

  const isImageLoaded = Boolean(selectedImage);
  const isImageAndProofPresent = isImageLoaded && Boolean(proof);

  const isMetamaskConnected = !!account;

  const webcamRef = React.useRef(null);
  const capture = React.useCallback(() => {
    //@ts-ignore
    const imageSrc = webcamRef?.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  useEffect(() => {
    if (!image || !session) return;
    classify(image, session);
  }, [image, session]);

  const onSuccess = (proof: any) => {
    setValidated(true);
  };

  const isReady = !!embedding && embedding?.length > 0;

  return (
    <div className="min-h-screen items-center py-2 ">
      <Head>
        <title>Show Your Unique Identity</title>
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta
          property="og:image"
          content="https://ethereum-bootcamp-frontend.vercel.app/og-image.png"
        />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <ToastContainer position="bottom-center" autoClose={1500} closeOnClick />

      <div className="flex my-4 text-center px-5 justify-between">
        <div className="flex justify-center items-center">
          <span
            className="w-20  h-20 block"
            style={{
              backgroundImage: `url('/unic_logo.png')`,
              backgroundPosition: "center",
              backgroundSize: "cover",
            }}
          ></span>
          <div
            className="font-bold text-white sm:text-8xl lg:text-[4rem]"
            onClick={() => router.push("/")}
          >
            UNIC
          </div>
        </div>

        {!isMetamaskConnected && (
          <button
            type="button"
            className="flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-14  py-8 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
            onClick={connectWallet}
          >
            Connect Wallet
          </button>
        )}
        {isMetamaskConnected && (
          <div className="flex justify-between">
            <div className="flex flex-row h-full place-items-center justify-center">
              <button
                type="button"
                className="flex items-center justify-center rounded-xl border border-transparent bg-white w-full px-4  py-4 text-base font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
                onClick={() => router.push("/claim")}
              >
                Airdrop Claim Page
              </button>
            </div>
            <div className="flex w-full items-center gap-2 mx-auto justify-end">
              <Address address={account} />
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-row mt-20">
        <div className="w-full text-center h-[500px]">
          <h2 className="font-bold text-white  sm:text-4xl lg:text-4xl">
            Connect with FaceID
          </h2>
          {!webcam && (
            <div className="flex flex-row h-full place-items-center justify-center">
              <button
                type="button"
                className={primaryButtonClasses}
                onClick={() => setWebcam(true)}
              >
                Enable Webcam
              </button>
            </div>
          )}
          {webcam && (
            <main className="flex w-full flex-1 flex-col items-center px-20 pt-12 text-center">
              <div className="my-2">
                {/* <WebcamCapture setImage={setImage} /> */}
                <Webcam
                  audio={false}
                  height={720}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width={1280}
                  videoConstraints={videoConstraints}
                  className="w-6/12 mx-auto"
                />
                {/* <button onClick={capture}>Capture photo</button> */}
              </div>

              <div className="my-12 mt-6">
                {!isModelLoaded && <p>Loading model ...</p>}

                {isModelLoaded && (
                  <div className="flex flex-col gap-8 items-center">
                    <div className="flex gap-2 mt-4">
                      <div>
                        <button
                          className={primaryButtonClasses}
                          // onClick={() => classifyAndGenerateProof(image, session)}
                          onClick={capture}
                          // disabled={!image}
                        >
                          Capture
                        </button>
                      </div>
                      <div>
                        {/* <button
                          className={primaryButtonClasses}
                          onClick={() => verifyProof(proof, publicSignals)}
                          disabled={!Boolean(proof)}
                        >
                          Verify Proof on chain
                        </button> */}
                      </div>
                    </div>
                    {/* {prediction !== null && prediction !== undefined && (
                      <ClassifyResult prediction={prediction} proof={proof} />
                    )} */}
                  </div>
                )}
              </div>
            </main>
          )}
        </div>
      </div>

      {isReady && (
        <div className="flex flex-row h-full place-items-center justify-center">
          <button
            type="button"
            className="mt-32 flex items-center justify-center rounded-2xl border border-transparent bg-blue-400 px-14  py-4 text-xl font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
            onClick={() => addUser()}
          >
            Add Identity On Chain
          </button>
        </div>
      )}
      {/* <Footer /> */}
    </div>
  );
};

export default Home;
