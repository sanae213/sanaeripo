const form = document.getElementById("diagnosisForm");
const report = document.getElementById("report");
const submitBtn = document.getElementById("submitBtn");
const apiKeyInput = document.getElementById("apiKey");
const promptInput = document.getElementById("analysisPrompt");

function buildUserPrompt(data) {
  return `以下の商品情報を分析してください。

会社名: ${data.companyName}
商品名: ${data.productName}
商品説明: ${data.productDescription}
ターゲット: ${data.target}
悩み: ${data.pain}
競合: ${data.competitors}
強み: ${data.strengths}
価格: ${data.price}
販売方法: ${data.salesMethod}`;
}

async function analyzeProduct(apiKey, systemPrompt, formData) {
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: buildUserPrompt(formData) }] },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`APIエラー: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.output_text || "レポートを取得できませんでした。";
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const apiKey = apiKeyInput.value.trim();
  const systemPrompt = promptInput.value.trim();

  if (!apiKey) {
    report.textContent = "OpenAI APIキーを入力してください。";
    return;
  }

  if (!systemPrompt) {
    report.textContent = "分析プロンプトを入力してください。";
    return;
  }

  const data = Object.fromEntries(new FormData(form).entries());
  submitBtn.disabled = true;
  report.textContent = "分析中です...";

  try {
    const result = await analyzeProduct(apiKey, systemPrompt, data);
    report.textContent = result;
  } catch (error) {
    report.textContent = `診断に失敗しました。\n${error.message}`;
  } finally {
    submitBtn.disabled = false;
  }
});
