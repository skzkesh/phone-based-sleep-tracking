
<template>
  <q-page class="column items-center justify-evenly">
    <div>
      <h4 class="color-red">Phone Based Sleep Tracker</h4>
    </div>
    <div>
      <button class="bg-red" @click="startTracking">Start</button>
      <button class="bg-green" @click="handleStop">Stop</button>
    </div>
    <div>
        <p>Data record:</p>
        <p>Sleep duration:</p>
        <p>Efficiency:</p>
        <p>Sleep quality:</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue';
import BASE_URL from '../../config';
import axios from 'axios';

interface Metrics {
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

interface SleepRecord {
  timestamp: number;
  rms: number;
}

const samples: Metrics[] = [];

const onMotion = (ev: DeviceMotionEvent) => {
  const a = ev.acceleration || ev.accelerationIncludingGravity;
  if (!a) return;
  const x: number = a.x || 0,
    y: number = a.y || 0,
    z: number = a.z || 0;
  const timestamp: number = Date.now();
  samples.push({ timestamp, x, y, z });
}

const startTracking = async() => {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  ) {
    try {
      const res: string = await  (DeviceMotionEvent as any).requestPermission();
      if (res !== 'granted') return;
    }
    catch (err) {
      console.warn('Permission request error', err);
      return;
    }
  window.addEventListener('devicemotion', onMotion, { passive: true });
}

const computeRMS = (x: number, y: number, z: number): number => {
  const rms: number = Math.sqrt((x*x + y*y + z*z) / 3)
  return rms;
}

const computeMinuteRMS = (samples: Sample[]): SleepRecord => {
  const record: SleepRecord[] = [];
  const grouped: { [minuteStartTimestamp: number]: Metrics[] } = {};

  for (const sample of samples) {
    const minuteStart = Math.floor(sample.timestamp / 60000) * 60000;

    if (!grouped[minuteStart]) {
      grouped[minuteStart] = [];
    }
    grouped[minuteStart].push(sample);
  }

  for (const minuteStartStr in grouped) {
    const minuteStart = Number(minuteStartStr);
    const minuteSamples = grouped[minuteStart];
    let totalRMS = 0;

    for (const s of minuteSamples) {
      totalRMS += computeRMS(s.x, s.y, s.z);
    }

    const avgRMS = totalRMS / minuteSamples.length;
    record.push({
      timestamp: minuteStart, // in ms
      rms: avgRMS
    });
  }
  return record;
}

const handleStop = async() => {
  window.removeEventListener('devicemotion', onMotion);
  await submitData();
}

const submitData = async() => {
  try {
    // const samples
    const minuteRMS = computeMinuteRMS(samples);
    const response = await axios.post(`${BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        minuteRMS,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    const { duration, efficiency, quality, averageRMS } = result;

    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
</script>
