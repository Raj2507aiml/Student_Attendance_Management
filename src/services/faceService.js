import * as faceapi from 'face-api.js';
import { euclideanDistance, distanceToConfidence } from '../utils/helpers';
import { studentService } from './studentService';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model';
let modelsLoaded = false;
let loadingPromise = null;

export const faceService = {
  async loadModels(onProgress) {
    if (modelsLoaded) return true;
    if (loadingPromise) return loadingPromise;
    loadingPromise = (async () => {
      onProgress?.(10);
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      onProgress?.(45);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      onProgress?.(70);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
      onProgress?.(100);
      modelsLoaded = true;
      return true;
    })().catch((err) => {
      loadingPromise = null;
      throw err;
    });
    return loadingPromise;
  },

  isReady() {
    return modelsLoaded;
  },

  async getDescriptorFromImage(imgEl) {
    await this.loadModels();
    const detection = await faceapi
      .detectSingleFace(imgEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    if (!detection) throw new Error('No face detected. Use a clear front-facing photo.');
    return detection.descriptor;
  },

  async detectFromVideo(videoEl) {
    await this.loadModels();
    const detection = await faceapi
      .detectSingleFace(videoEl, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.5 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection || null;
  },

  matchDescriptor(descriptor, threshold = 0.5) {
    const registered = studentService.list().filter((s) => Array.isArray(s.faceDescriptor) && s.faceDescriptor.length);
    if (!registered.length) return { matched: false, reason: 'No registered faces' };

    let best = null;
    let bestDistance = Infinity;
    registered.forEach((student) => {
      const dist = euclideanDistance(descriptor, student.faceDescriptor);
      if (dist < bestDistance) {
        bestDistance = dist;
        best = student;
      }
    });

    const confidence = distanceToConfidence(bestDistance, threshold);
    if (bestDistance <= threshold) {
      return { matched: true, student: best, distance: bestDistance, confidence };
    }
    return { matched: false, student: best, distance: bestDistance, confidence, reason: 'Face not recognized' };
  },

  async registerStudentFace(studentId, imgEl, photoDataUrl) {
    const descriptor = await this.getDescriptorFromImage(imgEl);
    return studentService.saveFaceDescriptor(studentId, descriptor, photoDataUrl);
  },
};
