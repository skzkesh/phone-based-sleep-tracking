<script setup lang="ts">
//import { ref, defineExpose } from "vue";

//const metrics = ref<{ timestamp: number; x: number; y: number; z: number }>;

interface Metrics {
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

interface RMS {
  timestamp: number;
  rms: number;
}

const samples: Metrics[] = [];

const startTracking = async() => {
  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    const res: string = await DeviceMotionEvent.requestPermission();
    if (res !== 'granted') return;
  }
  window.addEventListener('devicemotion', onMotion, { passive: true });
}

const onMotion = (ev) => {
  const a = ev.acceleration || ev.accelerationIncludingGravity;
  if (!a) return;
  const x: number = a.x || 0,
    y: number = a.y || 0,
    z: number = a.z || 0;
  const timestamp: number = Date.now();
  // Units may be m/s^2. Optionally convert to g: divide by 9.80665.
  samples.push({ timestamp, x, y, z });
}

const computeMinuteRMS = (x: number, y: number, z: number): number => {
  const rms: number = Math.sqrt((x*x + y*y + z*z) / 3)
  return rms;
}

const handleStop = async() => {
  await submitData();
}

const submitData = async() => {
  try {
    // const samples
    const response = await fetch('https://', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        samples,
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    console.log('Success:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
</script>

<template>
  <q-page class="column items-center justify-evenly">
    <div>
      <h4 class="color-red">Phone Based Sleep Tracker</h4>
    </div>
    <div>
      <button class="bg-red">Start</button>
      <button class="bg-green">Stop</button>
    </div>
    <div>
        <p>Data record:</p>
        <p>Sleep duration:</p>
        <p>Efficiency:</p>
        <p>Sleep quality:</p>
    </div>
  </q-page>
</template>
