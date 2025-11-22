<template>
  <div ref="container" class="w-full h-96 bg-gray-100 rounded-lg overflow-hidden" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, shallowRef } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

interface Props {
  color?: string
  textureType?: 'wood' | 'metal' | 'brick' | 'tile' | 'concrete'
}

const props = withDefaults(defineProps<Props>(), {
  color: '#FF69B4',
  textureType: 'wood',
})

const container = ref(null)

// Используем shallowRef для Three.js объектов чтобы избежать реактивности
const scene = shallowRef(null)
const camera = shallowRef(null)
const renderer = shallowRef(null)
const controls = shallowRef(null)
const cube = shallowRef(null)

// Создаем нормальные карты для разных материалов
const createNormalMaps = (): Record<string, THREE.CanvasTexture> => {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Could not get canvas context')

  const normalMaps: Record<string, THREE.CanvasTexture> = {}

  // Дерево - вертикальные полосы
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      const noise = Math.sin(x * 0.1) * 0.3 + Math.random() * 0.1
      const r = 128 + Math.floor(noise * 127)
      const g = 128
      const b = 128 + Math.floor(Math.cos(x * 0.05) * 127)
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(x, y, 1, 1)
    }
  }
  normalMaps.wood = new THREE.CanvasTexture(canvas)

  // Металл - мелкие неровности
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      const noise1 = Math.sin(x * 0.3) * Math.cos(y * 0.3) * 0.2
      const noise2 = Math.random() * 0.1
      const r = 128 + Math.floor((noise1 + noise2) * 127)
      const g = 128
      const b = 128 + Math.floor(Math.cos(x * 0.1) * Math.sin(y * 0.1) * 127)
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(x, y, 1, 1)
    }
  }
  normalMaps.metal = new THREE.CanvasTexture(canvas)

  // Кирпич - четкие границы между кирпичами
  context.fillStyle = 'rgb(128, 128, 255)'
  context.fillRect(0, 0, 256, 256)
  context.fillStyle = 'rgb(128, 128, 200)'
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 64) {
      // Вертикальные швы между кирпичами
      context.fillRect(x + 60, y, 4, 30)
      // Горизонтальные швы
      context.fillRect(x, y + 28, 64, 4)
    }
  }
  normalMaps.brick = new THREE.CanvasTexture(canvas)

  // Плитка - сетка плиток
  context.fillStyle = 'rgb(128, 128, 255)'
  context.fillRect(0, 0, 256, 256)
  context.fillStyle = 'rgb(128, 128, 200)'
  for (let y = 0; y < 256; y += 32) {
    for (let x = 0; x < 256; x += 32) {
      // Границы между плитками
      context.fillRect(x + 30, y, 2, 32)
      context.fillRect(x, y + 30, 32, 2)
    }
  }
  normalMaps.tile = new THREE.CanvasTexture(canvas)

  // Бетон - шероховатая поверхность
  for (let x = 0; x < 256; x++) {
    for (let y = 0; y < 256; y++) {
      const noise = (Math.random() - 0.5) * 0.4
      const r = 128 + Math.floor(noise * 127)
      const g = 128
      const b = 128 + Math.floor((Math.random() - 0.5) * 127)
      context.fillStyle = `rgb(${r}, ${g}, ${b})`
      context.fillRect(x, y, 1, 1)
    }
  }
  normalMaps.concrete = new THREE.CanvasTexture(canvas)

  // Настройка повторения нормальных карт
  Object.values(normalMaps).forEach((normalMap) => {
    if (normalMap instanceof THREE.CanvasTexture) {
      normalMap.wrapS = THREE.RepeatWrapping
      normalMap.wrapT = THREE.RepeatWrapping
      normalMap.repeat.set(2, 2)
    }
  })

  return normalMaps
}

const normalMaps = createNormalMaps()

// Базовые цвета для материалов
const baseColors = {
  wood: '#8B4513',
  metal: '#808080',
  brick: '#B22222',
  tile: '#F5F5DC',
  concrete: '#A9A9A9',
}

const initScene = () => {
  if (!container.value) return

  // Создание сцены
  scene.value = new THREE.Scene()
  scene.value.background = new THREE.Color(0xf8fafc)

  // Создание камеры
  camera.value = new THREE.PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000,
  )
  camera.value.position.x = 0.9137468650740026
  camera.value.position.y = 1.7979736410598428
  camera.value.position.z = 1.3790485903703713
  // Создание рендерера
  renderer.value = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  })
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight)
  renderer.value.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.value.appendChild(renderer.value.domElement)

  // Добавление освещения
  addLighting()

  // Создание плиты
  createCube()

  // Настройка контролов
  controls.value = new OrbitControls(camera.value, renderer.value.domElement)
  controls.value.enableDamping = true
  controls.value.dampingFactor = 0.05
  controls.value.target.set(0, 0, 0)
}

const addLighting = () => {
  // Основной свет
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.value.add(ambientLight)

  // Направленный свет (лампа) - важно для нормальных карт
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
  directionalLight.position.set(5, 5, 5)
  directionalLight.castShadow = true
  scene.value.add(directionalLight)

  // Дополнительный свет сбоку для лучшего отображения рельефа
  const sideLight = new THREE.DirectionalLight(0xffffff, 0.5)
  sideLight.position.set(-3, 2, 4)
  scene.value.add(sideLight)
}

const createCube = () => {
  const geometry = new THREE.BoxGeometry(2, 0.05, 2)

  // Создание материалов для каждой грани
  const materials = []

  // Верхняя грань (index 2) - с нормальной картой и базовым цветом материала
  materials.push(
    new THREE.MeshStandardMaterial({
      color: baseColors[props.textureType],
      normalMap: normalMaps[props.textureType],
      roughness: getRoughness(props.textureType),
      metalness: getMetalness(props.textureType),
    }),
  )

  // Задняя грань (index 1) - простой материал
  materials.push(
    new THREE.MeshStandardMaterial({
      color: baseColors[props.textureType],
      roughness: getRoughness(props.textureType),
      metalness: getMetalness(props.textureType),
    }),
  )

  // Передняя грань (index 0) - окрашена цветом из props
  materials.push(
    new THREE.MeshStandardMaterial({
      color: props.color,
      roughness: 0.7,
      metalness: 0.1,
    }),
  )

  // Нижняя грань (index 3) - простой материал
  materials.push(
    new THREE.MeshStandardMaterial({
      color: baseColors[props.textureType],
      roughness: getRoughness(props.textureType),
      metalness: getMetalness(props.textureType),
    }),
  )

  // Правая грань (index 4) - простой материал
  materials.push(
    new THREE.MeshStandardMaterial({
      color: baseColors[props.textureType],
      roughness: getRoughness(props.textureType),
      metalness: getMetalness(props.textureType),
    }),
  )

  // Левая грань (index 5) - простой материал
  materials.push(
    new THREE.MeshStandardMaterial({
      color: baseColors[props.textureType],
      roughness: getRoughness(props.textureType),
      metalness: getMetalness(props.textureType),
    }),
  )

  cube.value = new THREE.Mesh(geometry, materials)
  cube.value.castShadow = true
  cube.value.receiveShadow = true
  scene.value.add(cube.value)
}

const getRoughness = (textureType: string) => {
  const roughnessMap = {
    wood: 0.8,
    metal: 0.3,
    brick: 0.9,
    tile: 0.4,
    concrete: 0.95,
  }
  return roughnessMap[textureType] || 0.7
}

const getMetalness = (textureType: string) => {
  const metalnessMap = {
    wood: 0.0,
    metal: 0.8,
    brick: 0.1,
    tile: 0.2,
    concrete: 0.05,
  }
  return metalnessMap[textureType] || 0.1
}

const updateColor = () => {
  if (!cube.value) return
  // Обновляем цвет передней грани (индекс 2)
  cube.value.material[2].color.set(props.color)
}

const updateTexture = () => {
  if (!cube.value) return

  // Обновляем верхнюю грань (индекс 0) с нормальной картой
  cube.value.material[0].normalMap = normalMaps[props.textureType]
  cube.value.material[0].color.set(baseColors[props.textureType])
  cube.value.material[0].roughness = getRoughness(props.textureType)
  cube.value.material[0].metalness = getMetalness(props.textureType)
  cube.value.material[0].needsUpdate = true

  // Обновляем остальные грани (1, 3, 4, 5) базовым цветом
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: baseColors[props.textureType],
    roughness: getRoughness(props.textureType),
    metalness: getMetalness(props.textureType),
  })

  const sideIndices = [1, 3, 4, 5]
  sideIndices.forEach((index) => {
    cube.value.material[index].dispose()
    cube.value.material[index] = sideMaterial.clone()
  })
}

const animate = () => {
  requestAnimationFrame(animate)

  if (controls.value) {
    controls.value.update()
  }

  if (renderer.value && scene.value && camera.value) {
    renderer.value.render(scene.value, camera.value)
  }
}

const onWindowResize = () => {
  if (!camera.value || !renderer.value || !container.value) return

  camera.value.aspect = container.value.clientWidth / container.value.clientHeight
  camera.value.updateProjectionMatrix()
  renderer.value.setSize(container.value.clientWidth, container.value.clientHeight)
}

// Наблюдатели за изменениями props
watch(() => props.color, updateColor)
watch(() => props.textureType, updateTexture)

onMounted(() => {
  initScene()
  animate()
  window.addEventListener('resize', onWindowResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onWindowResize)
  if (renderer.value) {
    renderer.value.dispose()
  }
  // Очистка Three.js объектов
  if (scene.value) {
    scene.value.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
})
</script>
