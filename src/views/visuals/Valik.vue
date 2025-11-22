<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Refs
const contentRef = ref(null)
const paintFillRef = ref(null)
const scrollProgress = ref(0)
const currentSection = ref(1)
const isScrolling = ref(false)
const lastScrollTime = ref(0)

// Состояние брызг
const activeSplashes = ref([])
const splashIdCounter = ref(0)

// Данные контента
const contentSections = ref([
    {
        id: 1,
        title: 'Предпросмотр текстуры краски',
        content: [
            'Мы предоставляем реалистичный предварительный просмотр текстуры акриловой краски при помощи WebGL и сложных шейдеров.',
            'Эффект включает в себя неровности, переливы и характерные для акриловой краки особенности.'
        ]
    },
    {
        id: 2,
        title: 'Просмотр деталей заказа и процесса транспартировки краски',
        content: [
            'Вы можете просмотреть все детали вашего заказа, включая тип краски, объем и дополнительные опции.',
            'Также доступна информация о процессе транспортировки и ожидаемом времени доставки.'
        ]
    },
    {
        id: 3,
        title: 'Связь с менеджером и уточнение деталей заказа',
        content: [
            'Наши менеджеры всегда готовы помочь вам с выбором краски и ответить на все ваши вопросы.',
            'Вы можете связаться с ними через чат или по телефону для уточнения деталей заказа.'
        ]
    },
    {
        id: 4,
        title: 'И конечно же крутейший валик с краской!',
        content: [
            'Этот валик не только выглядит реалистично, но и реагирует на прокрутку страницы, создавая эффект нанесения краски.',
            ' Наслаждайтесь визуальным представлением процесса покраски вашего контента!'
        ]
    }
])

// Стили для валика
const rollerStyle = computed(() => {
    const rotation = scrollProgress.value * 15
    const bounce = Math.sin(scrollProgress.value * Math.PI * 4) * 3

    return {
        transform: `translateY(${scrollProgress.value * 100}vh) 
                rotate(${rotation}deg)
                translateY(${bounce}px)`,
        opacity: 1 - (scrollProgress.value * 0.2)
    }
})

// Стили для заполнения краской
const paintFillStyle = computed(() => ({
    height: `${scrollProgress.value * 100}%`,
    background: `linear-gradient(
    to bottom,
    hsl(0, 85%, 55%) 0%,
    hsl(0, 80%, 50%) 30%,
    hsl(0, 75%, 45%) 70%,
    hsl(0, 70%, 40%) 100%
  )`
}))

// Стили для эффекта мокрой краски
const wetEffectStyle = computed(() => ({
    opacity: 0.3 + (Math.sin(Date.now() / 1000) * 0.2),
    transform: `translateY(${Math.sin(Date.now() / 800) * 5}px)`
}))

// Стили для капель
const dripStyle = (index) => ({
    animationDelay: `${index * 0.7}s`,
    left: `${20 + index * 15}%`
})

// Стили для брызг
const splashStyle = (splash) => ({
    left: `${splash.x}px`,
    top: `${splash.y}px`,
    width: `${splash.size}px`,
    height: `${splash.size}px`,
    opacity: splash.opacity,
    transform: `rotate(${splash.rotation}deg) scale(${splash.scale})`,
    background: `radial-gradient(circle at 30% 30%, 
    hsla(0, 100%, 70%, 0.8) 0%,
    hsla(0, 80%, 50%, 0.6) 50%,
    transparent 70%)`
})

// Обработчик скролла
const handleScroll = () => {
    if (!contentRef.value) return

    const scrollTop = contentRef.value.scrollTop
    const scrollHeight = contentRef.value.scrollHeight - contentRef.value.clientHeight
    const newProgress = scrollHeight > 0 ? scrollTop / scrollHeight : 0

    // Определяем текущую секцию
    const sectionHeight = scrollHeight / (contentSections.value.length + 2)
    currentSection.value = Math.min(
        contentSections.value.length,
        Math.floor(scrollTop / sectionHeight) + 1
    )

    // Создаем брызги при изменении скролла
    if (Math.abs(newProgress - scrollProgress.value) > 0.001) {
        createSplashes()
    }

    scrollProgress.value = newProgress
    lastScrollTime.value = Date.now()
    isScrolling.value = true
}

// Обработчик колесика мыши
const handleWheel = () => {
    lastScrollTime.value = Date.now()
    isScrolling.value = true
}

// Создание брызг
const createSplashes = () => {
    // const now = Date.now()

    // // Создаем 1-3 брызги за раз
    // const splashCount = 1 + Math.floor(Math.random() * 3)

    // for (let i = 0; i < splashCount; i++) {
    //   if (Math.random() > 0.4) {
    //     const splash = {
    //       id: splashIdCounter.value++,
    //       x: 0 + Math.random() * 80,
    //       y: scrollProgress.value * 100 + Math.random() * 50 - 100,
    //       size: 8 + Math.random() * 15,
    //       opacity: 0.4 + Math.random() * 0.4,
    //       rotation: Math.random() * 360,
    //       scale: 0.8 + Math.random() * 0.4,
    //       createdAt: now
    //     }

    //     activeSplashes.value.push(splash)

    //     // Удаляем брызгу через 2-4 секунды
    //     setTimeout(() => {
    //       activeSplashes.value = activeSplashes.value.filter(s => s.id !== splash.id)
    //     }, 2000 + Math.random() * 2000)
    //   }
    // }
}

// Проверка активности скролла
const checkScrollActivity = () => {
    const now = Date.now()
    if (now - lastScrollTime.value > 100) {
        isScrolling.value = false
    }
}

// Сброс эффекта
const resetEffect = () => {
    if (contentRef.value) {
        contentRef.value.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }
    scrollProgress.value = 0
    currentSection.value = 1
    activeSplashes.value = []
}

// Инициализация
onMounted(() => {
    // Запускаем проверку активности скролла
    setInterval(checkScrollActivity, 100)

    // Создаем начальные брызги
    setTimeout(() => {
        for (let i = 0; i < 8; i++) {
            setTimeout(createSplashes, i * 300)
        }
    }, 1000)
})

// Очистка
onUnmounted(() => {
    // Здесь можно очистить интервалы при необходимости
})
</script>

<template>
    <div class="paint-roller-app">
        <!-- Реалистичный валик -->
        <div class="paint-roller-container" :style="rollerStyle">
            <div class="paint-roller">
                <!-- Рукоятка валика -->
                <div class="roller-handle">
                    <div class="handle-grip"></div>
                    <div class="handle-connector"></div>
                </div>

                <!-- Цилиндр валика -->
                <div class="roller-cylinder">
                    <div class="roller-texture"></div>
                    <div class="paint-drip" v-for="n in 3" :key="n" :style="dripStyle(n)"></div>
                </div>

                <!-- Брызги от валика -->
                <div v-for="splash in activeSplashes" :key="splash.id" class="paint-splash"
                    :style="splashStyle(splash)">
                </div>
            </div>
        </div>

        <!-- След краски -->
        <div class="paint-trail">
            <div class="paint-fill" :style="paintFillStyle" ref="paintFillRef">
                <!-- Текстура краски -->
                <div class="paint-texture-layer texture-1"></div>
                <div class="paint-texture-layer texture-2"></div>
                <div class="paint-texture-layer texture-3"></div>

                <!-- Эффект свежести краски -->
                <div class="wet-effect" :style="wetEffectStyle"></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.paint-roller-app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #f5f7fa;
}

/* Контейнер для скролла */
.content-scrollable {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    margin-left: 140px;
    position: relative;
    z-index: 2;
}

.content-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}

/* Секции контента */
.hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 0;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
}

.hero-description {
    font-size: 1.3rem;
    line-height: 1.7;
    color: #5a6c7d;
    max-width: 600px;
}

.content-section {
    min-height: 100vh;
    padding: 80px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #e1e8ed;
}

.section-highlighted {
    background: linear-gradient(90deg, rgba(52, 152, 219, 0.05) 0%, transparent 100%);
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #2c3e50;
}

.section-content {
    max-width: 700px;
}

.section-content p {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #5a6c7d;
    margin-bottom: 1.5rem;
}

.final-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 80px 0;
}

.final-section h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
}

.final-section p {
    font-size: 1.2rem;
    color: #5a6c7d;
    margin-bottom: 2.5rem;
    max-width: 500px;
}

.reset-button {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.reset-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.button-icon {
    font-size: 1.2rem;
}

/* Стили валика */
.paint-roller-container {
    position: fixed;
    left: 40px;

    transform: translateY(-50%);
    z-index: 20;
    transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    pointer-events: none;
}

.paint-roller {
    position: relative;
    left: -15px;
    width: 90px;
    height: 200px;
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}

/* Рукоятка валика */
.roller-handle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 120px;
    z-index: 3;
}

.handle-grip {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 20px;
    background: linear-gradient(to bottom, #8B4513, #A0522D, #8B4513);
    border-radius: 10px;
    box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.handle-connector {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 100px;
    background: linear-gradient(to bottom, #A0522D, #8B4513, #A0522D);
    border-radius: 6px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* Цилиндр валика */
.roller-cylinder {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 30px;
    background: #c0c0c0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
        inset 0 0 20px rgba(0, 0, 0, 0.4),
        0 5px 15px rgba(0, 0, 0, 0.4);
    z-index: 2;
}

.roller-texture {
    width: 200%;
    height: 100%;
    background:
        repeating-linear-gradient(0deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.9) 8%,
            rgba(200, 200, 200, 0.9) 8%,
            rgba(200, 200, 200, 0.9) 16%);
    animation: rotateRoller 4s linear infinite;
    transform-origin: center;
}

@keyframes rotateRoller {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}



@keyframes dripping {

    0%,
    100% {
        height: 15px;
        opacity: 0.8;
    }

    50% {
        height: 25px;
        opacity: 1;
    }
}

/* Брызги краски */
.paint-splash {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transition:
        opacity 1s ease-out,
        transform 1s ease-out;
}

/* След краски */
.paint-trail {
    position: fixed;
    left: 0;
    top: 0;
    width: 140px;
    height: 100vh;
    z-index: 10;
    pointer-events: none;
}

.paint-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-right: 5px solid #c0392b;
    box-shadow:
        5px 0 20px rgba(231, 76, 60, 0.3),
        inset -5px 0 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Слои текстуры краски */
.paint-texture-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.texture-1 {
    background:
        repeating-linear-gradient(45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px);
    mix-blend-mode: overlay;
}

.texture-2 {
    background:
        radial-gradient(circle at 30% 20%,
            rgba(255, 255, 255, 0.3) 5%,
            transparent 15%),
        radial-gradient(circle at 80% 80%,
            rgba(255, 255, 255, 0.2) 5%,
            transparent 15%);
    mix-blend-mode: soft-light;
}

.texture-3 {
    background:
        linear-gradient(to bottom,
            transparent 90%,
            rgba(0, 0, 0, 0.1) 100%);
}

/* Эффект мокрой краски */
.wet-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(ellipse at center,
            rgba(255, 255, 255, 0.4) 0%,
            transparent 70%);
    mix-blend-mode: overlay;
    transition: all 1s ease;
    pointer-events: none;
}

/* Адаптивность */
@media (max-width: 768px) {
    .content-scrollable {
        margin-left: 100px;
        padding: 20px;
    }

    .paint-trail {
        width: 100px;
    }

    .paint-roller-container {
        left: 25px;
        transform: scale(0.7) translateY(-50%);
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .section-title {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .content-scrollable {
        margin-left: 80px;
        padding: 15px;
    }

    .paint-trail {
        width: 80px;
    }

    .paint-roller-container {
        left: 15px;
        transform: scale(0.6) translateY(-50%);
    }
}

</><style scoped>.paint-roller-app {
    position: relative;
    width: 100%;
    height: 100vh;
    overflow: hidden;
    background: #f5f7fa;
}

/* Контейнер для скролла */
.content-scrollable {
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;
    margin-left: 140px;
    position: relative;
    z-index: 2;
}

.content-main {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px;
}

/* Секции контента */
.hero-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 60px 0;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 800;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    line-height: 1.2;
}

.hero-description {
    font-size: 1.3rem;
    line-height: 1.7;
    color: #5a6c7d;
    max-width: 600px;
}

.content-section {
    min-height: 100vh;
    padding: 80px 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-bottom: 1px solid #e1e8ed;
}

.section-highlighted {
    background: linear-gradient(90deg, rgba(52, 152, 219, 0.05) 0%, transparent 100%);
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: #2c3e50;
}

.section-content {
    max-width: 700px;
}

.section-content p {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #5a6c7d;
    margin-bottom: 1.5rem;
}

.final-section {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 80px 0;
}

.final-section h2 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    color: #2c3e50;
}

.final-section p {
    font-size: 1.2rem;
    color: #5a6c7d;
    margin-bottom: 2.5rem;
    max-width: 500px;
}

.reset-button {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    border: none;
    padding: 15px 30px;
    font-size: 1.1rem;
    border-radius: 50px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);
}

.reset-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(52, 152, 219, 0.4);
}

.button-icon {
    font-size: 1.2rem;
}

/* Стили валика */
.paint-roller-container {
    position: fixed;
    left: 40px;

    transform: translateY(-50%);
    z-index: 20;
    transition: transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    pointer-events: none;
}

.paint-roller {
    position: relative;
    left: -15px;
    width: 90px;
    height: 200px;
    filter: drop-shadow(0 5px 15px rgba(0, 0, 0, 0.3));
}

/* Рукоятка валика */
.roller-handle {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100%;
    height: 120px;
    z-index: 3;
}

.handle-grip {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 70px;
    height: 20px;
    background: linear-gradient(to bottom, #8B4513, #A0522D, #8B4513);
    border-radius: 10px;
    box-shadow:
        0 4px 10px rgba(0, 0, 0, 0.4),
        inset 0 2px 4px rgba(255, 255, 255, 0.2);
}

.handle-connector {
    position: absolute;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 100px;
    background: linear-gradient(to bottom, #A0522D, #8B4513, #A0522D);
    border-radius: 6px;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
}

/* Цилиндр валика */
.roller-cylinder {
    position: absolute;
    top: -20px;
    left: 50%;
    transform: translateX(-50%);
    width: 80px;
    height: 30px;
    background: #c0c0c0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow:
        inset 0 0 20px rgba(0, 0, 0, 0.4),
        0 5px 15px rgba(0, 0, 0, 0.4);
    z-index: 2;
}

.roller-texture {
    width: 200%;
    height: 100%;
    background:
        repeating-linear-gradient(0deg,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(255, 255, 255, 0.9) 8%,
            rgba(200, 200, 200, 0.9) 8%,
            rgba(200, 200, 200, 0.9) 16%);
    animation: rotateRoller 4s linear infinite;
    transform-origin: center;
}

@keyframes rotateRoller {
    0% {
        transform: translateX(0);
    }

    100% {
        transform: translateX(-50%);
    }
}



@keyframes dripping {

    0%,
    100% {
        height: 15px;
        opacity: 0.8;
    }

    50% {
        height: 25px;
        opacity: 1;
    }
}

/* Брызги краски */
.paint-splash {
    position: absolute;
    pointer-events: none;
    z-index: 1;
    transition:
        opacity 1s ease-out,
        transform 1s ease-out;
}

/* След краски */
.paint-trail {
    position: fixed;
    left: 0;
    top: 0;
    width: 140px;
    height: 100vh;
    z-index: 10;
    pointer-events: none;
}

.paint-fill {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    border-right: 5px solid #c0392b;
    box-shadow:
        5px 0 20px rgba(231, 76, 60, 0.3),
        inset -5px 0 20px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition: height 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Слои текстуры краски */
.paint-texture-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.texture-1 {
    background:
        repeating-linear-gradient(45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.1) 10px,
            rgba(255, 255, 255, 0.1) 20px);
    mix-blend-mode: overlay;
}

.texture-2 {
    background:
        radial-gradient(circle at 30% 20%,
            rgba(255, 255, 255, 0.3) 5%,
            transparent 15%),
        radial-gradient(circle at 80% 80%,
            rgba(255, 255, 255, 0.2) 5%,
            transparent 15%);
    mix-blend-mode: soft-light;
}

.texture-3 {
    background:
        linear-gradient(to bottom,
            transparent 90%,
            rgba(0, 0, 0, 0.1) 100%);
}

/* Эффект мокрой краски */
.wet-effect {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background:
        radial-gradient(ellipse at center,
            rgba(255, 255, 255, 0.4) 0%,
            transparent 70%);
    mix-blend-mode: overlay;
    transition: all 1s ease;
    pointer-events: none;
}

/* Адаптивность */
@media (max-width: 768px) {
    .content-scrollable {
        margin-left: 100px;
        padding: 20px;
    }

    .paint-trail {
        width: 100px;
    }

    .paint-roller-container {
        left: 25px;
        transform: scale(0.7) translateY(-50%);
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .section-title {
        font-size: 2rem;
    }
}

@media (max-width: 480px) {
    .content-scrollable {
        margin-left: 80px;
        padding: 15px;
    }

    .paint-trail {
        width: 80px;
    }

    .paint-roller-container {
        left: 15px;
        transform: scale(0.6) translateY(-50%);
    }
}
</style>