import React, { useState } from "react";

export default function FileHourlyAverageCalculator() {
  const [fileData, setFileData] = useState([]); // тут зберігаємо тільки "сирі" значення

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    setFileData([]); // очищаємо

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;

        const matches = Array.from(
          text.matchAll(
            /(\d{4}\/\d{2}\/\d{2})_(\d{2}):\d{2} value is\s+([\d.]+)\(pCi\/L\)/g,
          ),
        );

        const values = matches.map((m) => ({
          date: m[1],
          hour: m[2],
          value: parseFloat(m[3]),
        }));

        setFileData((prev) => [...prev, { name: file.name, values }]);
      };

      reader.readAsText(file);
    });
  };

  // допоміжні функції для рендеру
  const calculateAverage = (values) => {
    if (values.length === 0) return "Не знайдено значень";
    const sum = values.reduce((acc, v) => acc + v.value, 0);
    return (sum / values.length).toFixed(3);
  };

  const groupByHour = (values) => {
    const grouped = {};
    values.forEach(({ date, hour, value }) => {
      const key = `${date} ${hour}:00`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(value);
    });
    return Object.entries(grouped).map(([hour, vals]) => ({
      hour,
      avg: (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(3),
    }));
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Аналіз значень</h2>
      <input type="file" accept=".txt" onChange={handleFileUpload} multiple />

      <div className="mt-6 space-y-6">
        {fileData.map((file, i) => {
          const avg = calculateAverage(file.values);
          const hourly = groupByHour(file.values);

          return (
            <div key={i} className="border rounded-lg p-4 shadow pt-10 mt-10">
              <h3 className="text-lg font-semibold">{file.name}</h3>
              <p>
                Загальне середнє:{" "}
                <strong>
                  {avg} {avg !== "Не знайдено значень" && "pCi/L"}
                </strong>
              </p>

              {hourly.length > 0 && (
                <div className="mt-3">
                  <h4 className="font-medium mb-2">
                    Середні значення за годину:
                  </h4>
                  <ul className="list-disc ml-6">
                    {hourly.map((h, i2) => (
                      <li key={i2}>
                        {h.hour} → <strong>{h.avg} pCi/L</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
