export const calculateMedicalStats = (data, targets = { min: 70, max: 180 }) => {
    if (!data || data.length === 0) {
        return { average: 0, hba1c: 0, tir: 0, tbr: 0, tar: 0 };
    }

    const averageValue = parseFloat((data.reduce((acc, curr) => acc + curr.sugarLevel, 0) / data.length).toFixed(1));
    
    // HbA1c formula: (Average Glucose + 46.7) / 28.7
    const estimatedA1c = averageValue > 0 ? ((averageValue + 46.7) / 28.7).toFixed(1) : 0;

    // TIR (Time in Range): Custom min - max
    const tirCount = data.filter(d => d.sugarLevel >= targets.min && d.sugarLevel <= targets.max).length;
    const tirPercentage = Math.round((tirCount / data.length) * 100);

    // TBR (Time Below Range): < Custom min
    const tbrCount = data.filter(d => d.sugarLevel < targets.min).length;
    const tbrPercentage = Math.round((tbrCount / data.length) * 100);

    // TAR (Time Above Range): > Custom max
    const tarCount = data.filter(d => d.sugarLevel > targets.max).length;
    const tarPercentage = Math.round((tarCount / data.length) * 100);

    return {
        average: averageValue,
        hba1c: estimatedA1c,
        tir: tirPercentage,
        tbr: tbrPercentage,
        tar: tarPercentage
    };
};
