export function showToast(title, icon = "none") {
  if (typeof wx !== "undefined" && wx && typeof wx.showToast === "function") {
    wx.showToast({ title, icon });
    return;
  }
  console.log("[toast]", title);
}

export function speak(text) {
  if (!text) return;
  try {
    if (typeof speechSynthesis !== "undefined" && typeof SpeechSynthesisUtterance !== "undefined") {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = 1;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
      return;
    }
    if (typeof wx !== "undefined" && wx && typeof wx.getSpeechSynthesizer === "function") {
      const synthesizer = wx.getSpeechSynthesizer();
      if (synthesizer && typeof synthesizer.speak === "function") {
        synthesizer.speak({ text });
        return;
      }
    }
  } catch (error) {
    console.warn("TTS unavailable", error);
  }
  console.log("[speak]", text);
}

export function createRecognizer(onResult, onError) {
  if (typeof SpeechRecognition !== "undefined") {
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.onresult = (event) => {
      const best = event.results && event.results[0] && event.results[0][0];
      if (best) onResult(best.transcript || "");
    };
    recognition.onerror = (event) => {
      if (onError) onError(event.error || event.message || "recognition error");
    };
    return recognition;
  }

  if (typeof wx !== "undefined" && wx && typeof wx.getSpeechRecognizer === "function") {
    const recognizer = wx.getSpeechRecognizer();
    if (recognizer && typeof recognizer.start === "function") {
      if (typeof recognizer.onResult === "function") {
        recognizer.onResult((result) => onResult(result.text || result.transcript || ""));
      }
      if (typeof recognizer.onError === "function" && onError) {
        recognizer.onError((error) => onError(error.errMsg || "recognition error"));
      }
      return recognizer;
    }
  }

  return null;
}

export async function capturePhoto(cameraContext, stepId) {
  if (cameraContext && typeof cameraContext.takePhoto === "function") {
    return new Promise((resolve) => {
      cameraContext.takePhoto({
        quality: "high",
        success(res) {
          resolve({
            id: `photo-${Date.now()}`,
            source: "camera",
            stepId,
            path: res.tempImagePath || res.path || "",
            createdAt: new Date().toISOString()
          });
        },
        fail(error) {
          console.warn("takePhoto failed, using mock evidence", error);
          resolve(mockPhoto(stepId, "camera-failed"));
        }
      });
    });
  }
  return mockPhoto(stepId, "mock");
}

export function createCameraContextSafe() {
  try {
    if (typeof wx !== "undefined" && wx && typeof wx.createCameraContext === "function") {
      return wx.createCameraContext();
    }
  } catch (error) {
    console.warn("createCameraContext unavailable", error);
  }
  return null;
}

export async function detectBarcodeFromImage(imagePath) {
  try {
    if (typeof BarcodeDetector !== "undefined" && imagePath) {
      const detector = new BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13", "ean_8"] });
      if (typeof fetch === "function" && typeof createImageBitmap === "function") {
        const response = await fetch(imagePath);
        const blob = await response.blob();
        const bitmap = await createImageBitmap(blob);
        const results = await detector.detect(bitmap);
        if (results && results[0]) {
          return {
            value: results[0].rawValue || "",
            source: "barcode"
          };
        }
      }
    }
  } catch (error) {
    console.warn("barcode detect unavailable", error);
  }
  return {
    value: "",
    source: "manual"
  };
}

function mockPhoto(stepId, source) {
  return {
    id: `photo-${Date.now()}`,
    source,
    stepId,
    path: `mock://${stepId}/${Date.now()}.jpg`,
    createdAt: new Date().toISOString()
  };
}

export function normalizeVoiceCommand(text) {
  const value = String(text || "").trim();
  if (!value) return "unknown";
  if (/重拍|重新/.test(value)) return "retake";
  if (/异常|有问题|破损|划痕|缺件|不一致/.test(value)) return "abnormal";
  if (/sn|SN|imei|IMEI|编码|条码|读一下/.test(value)) return "record_code";
  if (/总结|售后|文案/.test(value)) return "summary";
  if (/下一步|已拍|完成|确认|好了/.test(value)) return "next";
  if (/拍照|记录|拍一张/.test(value)) return "capture";
  if (/退出|结束/.test(value)) return "exit";
  return "note";
}
