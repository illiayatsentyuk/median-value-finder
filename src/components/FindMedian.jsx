import React, { useState } from "react";

export default function FileHourlyAverageCalculator() {
  const [fileData, setFileData] = useState([]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files || files.length === 0) return;

    setFileData([]);

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
          date: m[1], // YYYY/MM/DD
          hour: m[2], // HH
          value: parseFloat(m[3]),
        }));

        setFileData((prev) => [...prev, { name: file.name, values }]);
      };

      reader.readAsText(file);
    });
  };

  const calculateAverage = (values) => {
    if (values.length === 0) return "Не знайдено значень";
    const sum = values.reduce((acc, v) => acc + v.value, 0);
    return (sum / values.length).toFixed(3);
  };

  // Групування всередині одного файлу (з датами)
  const groupByHourWithDate = (values) => {
    const grouped = {};
    values.forEach(({ date, hour, value }) => {
      const key = `${date} ${hour}:00`;
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(value);
    });
    return Object.entries(grouped).map(([hour, vals]) => ({
      hour,
      avg: (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(3),
      min: Math.min(...vals).toFixed(3),
      max: Math.max(...vals).toFixed(3),
    }));
  };

  // Групування по годинах без дат (для зведеної статистики)
  const groupByHourAllDays = (values) => {
    if (values.length === 0) return { range: "", hours: [] };

    // знайти мін і макс дату
    const dates = values.map((v) => new Date(v.date));
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));

    const formatDate = (d) =>
      `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${String(
        d.getDate(),
      ).padStart(2, "0")}`;

    const grouped = {};
    values.forEach(({ hour, value }) => {
      if (!grouped[hour]) grouped[hour] = [];
      grouped[hour].push(value);
    });

    const range = `${formatDate(minDate)} - ${formatDate(maxDate)}`;

    return {
      range,
      hours: Object.entries(grouped)
        .sort(([h1], [h2]) => parseInt(h1) - parseInt(h2)) // сортування від 00 до 23
        .map(([hour, vals]) => ({
          hour: `${hour}:00`,
          avg: (vals.reduce((a, v) => a + v, 0) / vals.length).toFixed(3),
          min: Math.min(...vals).toFixed(3),
          max: Math.max(...vals).toFixed(3),
        })),
    };
  };

  // ---- зведення з усіх файлів ----
  const allValues = fileData.flatMap((f) => f.values);
  const overallByHour = groupByHourAllDays(allValues);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Аналіз значень</h2>
      <input type="file" accept=".txt" onChange={handleFileUpload} multiple />

      {/* Загальне погодинне середнє */}
      {overallByHour.hours.length > 0 && (
        <div className="border rounded-lg p-4 shadow mt-6">
          <h3 className="text-lg font-semibold">
            Зведене погодинне середнє ({overallByHour.range})
          </h3>
          <ul className="list-disc ml-6 mt-2">
            {overallByHour.hours.map((h, i) => (
              <li key={i}>
                {h.hour} → <strong>{h.avg} pCi/L</strong> 
                {" (мін: "}
                {h.min}, макс: {h.max})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Індивідуальні файли */}
      <div className="mt-6 space-y-6">
        {fileData.map((file, i) => {
          const avg = calculateAverage(file.values);
          const hourly = groupByHourWithDate(file.values);

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
                    Середні значення за годину (окремо для файлу):
                  </h4>
                  <ul className="list-disc ml-6">
                    {hourly.map((h, i2) => (
                      <li key={i2}>
                        {h.hour} → <strong>{h.avg} pCi/L</strong>
                        {" (мін: "}
                        {h.min}, макс: {h.max})
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
