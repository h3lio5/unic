import React, { useState, useEffect } from "react";

import Link from "next/link";
import type { NextPage } from "next";
import Head from "next/head";

import axios from "axios";
import { Tensor, InferenceSession } from "onnxjs";
import { ToastContainer, toast } from "react-toastify";
import Webcam from "react-webcam";

import Address from "../components/Address";
import ClassifyResult from "../components/ClassifyResult";
import Footer from "../components/Footer";

import WorldIDWidget from "../components/WorldIDWidget";

import {
  getEthereumObject,
  setupEthereumEventListeners,
  getSignedContract,
  getCurrentAccount,
  connectWallet,
} from "../utils/ethereum";

import { buildContractCallArgs, generateProof } from "../utils/snark";
import { computeQuantizedEmbedding } from "../utils/model";

import metadata from "../data/Verifier.json";

import "react-toastify/dist/ReactToastify.css";

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "user",
};

const VERIFIER_CONTRACT_ADDR = "0x1Af593E29455b4AE097C7b76A0598561829fD7C0";
const VERIFIER_CONTRACT_ABI: any = metadata.abi;

const mlModelUrl = "/frontend_model.onnx";

const title = "Show Your Unique Identity";
const description =
  "Recognizing faces privately using ZK Snarks and Machine Learning";

const appHeading = "Show Your Unique Identity";
const appDescription =
  "One Identity, All Chains: Empowering Seamless Connectivity";

const primaryButtonClasses =
  "text-white bg-blue-500 hover:bg-blue-700 font-bold px-4 py-2 rounded-full shadow-lg disabled:opacity-50";

const titlePart1 = "UNIC";
const titlePart2 = "Show Your Unique Identity";

const Home: NextPage = () => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [session, setSession] = useState<any>();

  const [account, setAccount] = useState();
  const [verifierContract, setVerifierContract] = useState<any>();

  const [prediction, setPrediction] = useState<null | number>();
  const [publicSignals, setPublicSignals] = useState<number[]>();
  const [proof, setProof] = useState<any>();

  const [selectedImage, setSelectedImage] = useState<any>();

  const [image, setImage] = useState(null);

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

  const classifyAndGenerateProof = async (base64Image: any, session: any) => {
    if (!session) return;

    try {
      const result = await fetch(base64Image);
      const blob = await result.blob();

      const file = new File([blob], "filename.jpeg");

      const preProcessedData = await preProcess(file);
      if (!preProcessedData) return;

      let [modelOutput, _] = await runModel(session, preProcessedData);

      var output = modelOutput.data;
      const quantizedEmbedding = computeQuantizedEmbedding(output, 1);

      const { proof, publicSignals } = await generateProof(quantizedEmbedding);
      const maxValue = Math.max(...publicSignals);

      setPublicSignals(publicSignals);
      setPrediction(maxValue);
      setProof(proof);

      toast.success(
        "Face classification and proof generation completed successfully"
      );
    } catch (e) {
      console.warn(e);
    }
  };

  const verifyProof = async (proof: any, publicSignals: any) => {
    //@ts-ignore
    if (!window?.ethereum || !account) {
      toast.error("Please connect your MetaMask walet");
      return;
    }

    const callArgs = await buildContractCallArgs(proof, publicSignals);
    const result = await verifierContract.addUserByFace(...callArgs);

    if (result) {
      toast.success("User added!");
      return;
    }
    toast.error("Invalid user details!");
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

    const verifierContract = getSignedContract(
      VERIFIER_CONTRACT_ADDR,
      VERIFIER_CONTRACT_ABI
    );

    if (!verifierContract) return;

    const currentAccount = await getCurrentAccount();
    setVerifierContract(verifierContract);
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
    classifyAndGenerateProof(image, session);
  }, [image, session]);

  const onSuccess = (proof: any) => {
    console.log(proof);
  };

  return (
    <div
      className="flex justify-center place-items-center h-[92vh] overflow-hidden items-center border border-white m-10 rounded-2xl"
      // style={{
      //   backgroundImage: `url('/hero_bg.svg')`,
      //   width: "full",
      //   backgroundPosition: "center",
      // }}
    >
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

      <main className="flex w-full flex-1 flex-col items-center px-20 pt-12 text-center">
        <div className="maximum-width-control mb-1 ">
          <div className="flex justify-center items-center">
            <span
              className="w-32 h-32 block"
              style={{
                backgroundImage: `url('/unic_logo.png')`,
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            ></span>
            <h1 className="inline m-0 text-8xl font-bold text-white sm:text-8xl lg:text-[8rem]">
              {titlePart1}&nbsp;
            </h1>
          </div>
          <br />
          <br />

          <h1
            className="inline m-0 text-4xl font-bold text-white  sm:text-4xl lg:text-4xl "
            style={{
              lineHeight: "1.4",
            }}
          >
            {titlePart2}&nbsp;
          </h1>
        </div>

        <p className="mt-3 text-2xl  text-white">{appDescription}</p>

        <Link href={"/start"}>
          <button
            type="button"
            className="mt-10  flex w-full items-center justify-center rounded-2xl border border-transparent bg-white px-14  py-4 text-xl font-medium text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 tracking-wide"
          >
            Begin Journey
          </button>
        </Link>
      </main>
    </div>
  );
};

export default Home;
