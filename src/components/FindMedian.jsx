import React, { useState } from "react";

export default function FileHourlyAverageCalculator() {
  const [average, setAverage] = useState([]);
  const [hourlyAverages, setHourlyAverages] = useState([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    console.log(files);
    if (!files || files.length === 0) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;

      // Витягуємо дату, час і число
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

      if (values.length === 0) {
        setAverage([...average, { average: "Не знайдено значень" }]);
        setHourlyAverages([]);
        setIsFinished(true);
        return;
      }

      // Загальне середнє
      const sum = values.reduce((acc, v) => acc + v.value, 0);
      const avg = sum / values.length;
      setAverage([...average, { average: avg.toFixed(3) }]);

      // Середнє за годину
      const grouped = {};
      values.forEach(({ date, hour, value }) => {
        const key = `${date} ${hour}:00`;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(value);
      });

      const hourly = Object.entries(grouped).map(([hour, vals]) => {
        const sum = vals.reduce((acc, v) => acc + v, 0);
        return {
          hour,
          avg: (sum / vals.length).toFixed(3),
        };
      });

      setHourlyAverages([...hourlyAverages, hourly]);
      setIsFinished(true);
    };
    // console.log(files);
    files.forEach((file) => {
      reader.readAsText(file);
    });
  };

  return (
    <div className="p-4">
      <div className="w-full">
        <h2 className="text-xl font-bold mb-2">Аналіз значень</h2>
        <input type="file" accept=".txt" onChange={handleFileUpload} multiple />
      </div>
      {average.map((item, i) =>{
        console.log(hourlyAverages[i]);
        return (
        <>
          <p key={i}>
            Загальне середнє: <strong>{average[i].average} pCi/L</strong>
          </p>
          {hourlyAverages[i].length > 0 && (
            <div className="mt-4" key={i+1}>
              <h3 className="text-lg font-semibold mb-2">
                Середні значення за годину:
              </h3>
              <ul className="list-disc ml-6">
                {hourlyAverages[i].map((item, i2) => (
                  <li key={i2}>
                    {item.hour} → <strong>{item.avg} pCi/L</strong>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )})}
    </div>
  );
}
