import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
;
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

interface SleepData {
    timestamp: number;
    rms: number;
}

interface ActivityRecord {
    timestamp: number;
    status: string;
}
// Activity index: Average RMS per minute. -> sum of all RMS / number of minutes
const calculateAverageRMS = (samples: { timestamp: number; rms: number }[]): number => {
    const totalMinutes: number = samples.length;
    let totalRMS: number = 0;

    for (let i = 0; i < totalMinutes; i++){
        totalRMS += samples[i].rms;
    }

    const average = totalRMS / totalMinutes;
    return average;
}

// Rest detection: mark minutes with rms < threshold as low-activity
const restDetection = (samples: { timestamp: number; rms: number }[]): ActivityRecord[] => {
    const rest: ActivityRecord[] = [];
    const threshold: number = 0.0185; 
    for (let i = 0; i < samples.length; i++){
        rest[i].timestamp = samples[i].timestamp;
        if (samples[i].rms < threshold) {
            rest.push({ timestamp: samples[i].timestamp, status: "low-activity" });
        } 
        else {
            rest.push({ timestamp: samples[i].timestamp, status: "active" });
        }
    }
    return rest;
}

//Find the longest contiguous low‑activity block, using a sliding window (e.g., 60–100 minutes minimum) to infer the main sleep episode.
const sleepWindow = (rest: ActivityRecord[]): number[] => {
    let startIdx = 0;
    let endIdx = 0;
    let currStart = -1;

    for (let i = 0; i < rest.length; i++){
        if (rest[i].status === "low-activity") {
            if (currStart === -1) {
                currStart = i;
            if (i === rest.length - 1 || rest[i + 1].status !== "low-activity") {
                const currentEnd = i;
                const currEnd = i;
                const currDuration = rest[currEnd].timestamp - rest[currStart].timestamp;
                const maxDuration = rest[endIdx].timestamp - rest[startIdx].timestamp;
      
                if (currDuration > maxDuration) {
                    startIdx = currStart;
                    endIdx = currEnd;
                }
                currStart = -1;
            }
            }
        }
    }
    return [startIdx, endIdx];
}

const calculateTotalLowActivity = (rest: ActivityRecord[]): number => {
    let totalMinutes = 0;

    for (let i = 0; i < rest.length; i++){
        if (rest[i].status === "low-activity"){
            totalMinutes += 1;
        }
    }
    return totalMinutes;
}
// sleepOffset - sleepOnset (in hours)
const calculateDuration = (sleepDuration: number[]): number => {
    const sleepOnset: number = sleepDuration[0];
    const sleepOffset: number = sleepDuration[1];
    const duration = (sleepOffset - sleepOnset) /(1000 * 60 * 60);;
    return Math.max(duration, 0);;
};

// (lowActivityMinutes / totalInBedMinutes) * 100
const calculateEfficiency = (totalInBedMinutes: number, lowActivityMinutes: number): number => {
    const sleepEfficiency = (lowActivityMinutes / totalInBedMinutes) * 100;
    return sleepEfficiency;
}

// Heuristic tiered score (e.g., High if <10% high‑activity minutes during sleep; Medium if 10–20%; Low otherwise)
const calculateQuality = (totalInBedMinutes: number, lowActivityMinutes: number): string => {
    const totalHighActivity: number = ((totalInBedMinutes - lowActivityMinutes) / totalInBedMinutes) * 100;
    if (totalHighActivity < 10){
        return "High"
    }
    else if (totalHighActivity >= 10 && totalHighActivity <= 20){
        return "Medium"
    }
    return "Low";
}

app.get('/', (req: Request, res: Response) => {
  res.send('App Connected');
});

app.post('/analyze', async (req, res) => {
    try {
        const samples: { timestamp: number; rms: number }[] = req.body;
        
        const averageRMS: number = calculateAverageRMS(samples);
        const rest: ActivityRecord[] = restDetection(samples);
        const sleepPeriod: number[] = sleepWindow(rest);
        const lowActivityMinutes: number = calculateTotalLowActivity(rest);

        const duration = calculateDuration(sleepPeriod);
        const totalInBedMinutes = duration * 60;
        const efficiency = calculateEfficiency(totalInBedMinutes, lowActivityMinutes);
        const quality = calculateQuality(duration, lowActivityMinutes);

        res.json({ duration, efficiency, quality, averageRMS });
    }
    catch (error: unknown) {
        return res.status(500).json({ message: 'Server error', error: getErrorMessage(error) });
    }
});

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }
  

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});