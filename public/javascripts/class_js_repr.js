// Reproductor manteniendo la estructura: clase AudioPlayer
class AudioPlayer {
    constructor() {
        // Elementos DOM
        this.audio = document.getElementById('audio');
        this.playBtn = document.getElementById('playPause');
        this.prevBtn = document.getElementById('prev');
        this.nextBtn = document.getElementById('next');
        this.progressBar = document.getElementById('progressBar');
        this.progress = document.getElementById('progress');
        this.currentTimeEl = document.getElementById('currentTime');
        this.durationEl = document.getElementById('duration');
        this.volumeBtn = document.getElementById('volumeBtn');
        this.volumeSlider = document.getElementById('volumeSlider');
        this.titleEl = document.getElementById('titulo-track');
        this.tracks = Array.from(document.querySelectorAll('.track'));
        this.bits = 256;//32, 64, 128, 256, 512, 1024, 2048 
        // Estado
        this.isPlaying = false;
        this.isMuted = false;
        this.previousVolume = 1;
        this.current = 0;

        // WebAudio nodes (creados UNA vez)
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.gainNode = null;
        this.bufferLength = 0;
        this.dataArray = null;

        // Canvas
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationDraw = null;

        this._bindEvents();
        this._initialLoad();
        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());
    }

    // Cargar elementos iniciales
    _initialLoad() {
        if (this.tracks.length > 0) {
            this.loadTrack(0);
        }
        // set initial volume from slider
        if (this.volumeSlider) this.audio.volume = parseFloat(this.volumeSlider.value);
    }

    // Eventos UI
    _bindEvents() {
        this.playBtn.addEventListener('click', () => this.togglePlay());
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());

        this.tracks.forEach((el, idx) => {
            el.addEventListener('click', () => {
                this.loadTrack(idx);
                this.play();
            });
        });

        this.audio.addEventListener('loadedmetadata', () => this._setDuration());
        this.audio.addEventListener('timeupdate', () => this._updateProgress());
        this.audio.addEventListener('play', () => this._onPlay());
        this.audio.addEventListener('pause', () => this._onPause());
        this.audio.addEventListener('ended', () => this._onEnded());

        this.progressBar.addEventListener('click', (e) => this._seek(e));
        this.volumeSlider.addEventListener('input', () => this._setVolume());
        this.volumeBtn.addEventListener('click', () => this._toggleMute());

        // Start drawing visualizer loop
        this.animationDraw = requestAnimationFrame(() => this._draw());
    }

    // Resize canvas to CSS size (handles DPR)
    _resizeCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = Math.round(rect.width * dpr);
        this.canvas.height = Math.round(rect.height * dpr);
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Load track by index
    loadTrack(i) {
        if (!this.tracks[i]) return;
        this.current = i;
        this.tracks.forEach((t, idx) => t.classList.toggle('active', idx === i));
        const src = this.tracks[i].dataset.src;
        this.titleEl.textContent = this.tracks[i].textContent || 'Track';
        // set src and load
        this.audio.src = src;
        this.audio.load();
    }

    // Initialize AudioContext and nodes only once
    initAudioContextOnce() {
        if (this.audioContext) return;
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
            console.error('Web Audio no soportado', e);
            return;
        }

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = this.bits;
        this.bufferLength = this.analyser.frequencyBinCount; // fftSize/2
        this.dataArray = new Uint8Array(this.bufferLength);

        // createMediaElementSource must be called only once per media element
        this.source = this.audioContext.createMediaElementSource(this.audio);

        // Gain node to safely connect to destination
        this.gainNode = this.audioContext.createGain();
        this.gainNode.gain.value = 1.0;

        // connections: source -> analyser -> gain -> destination
        this.source.connect(this.analyser);
        this.analyser.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
    }

    // Play / pause helpers
    togglePlay() {
        if (!this.isPlaying) {
            this.play();
        } else {
            this.pause();
        }
    }

    play() {
        // ensure AudioContext created in a user gesture
        if (!this.audioContext) {
            this.initAudioContextOnce();
        }
        // resume if suspended (browsers)
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        // Try to play
        this.audio.play().catch(err => {
            console.warn('play() failed:', err);
        });
    }

    pause() {
        this.audio.pause();
    }

    prev() {
        if (this.tracks.length === 0) return;
        this.current = (this.current - 1 + this.tracks.length) % this.tracks.length;
        this.loadTrack(this.current);
        // slight delay to let load() settle
        setTimeout(() => this.play(), 60);
    }

    next() {
        if (this.tracks.length === 0) return;
        this.current = (this.current + 1) % this.tracks.length;
        this.loadTrack(this.current);
        setTimeout(() => this.play(), 60);
    }

    // Events from <audio>
    _onPlay() {
        this.isPlaying = true;
        this.playBtn.textContent = '| |';
        // init audio context if not yet (user gesture)
        if (!this.audioContext) this.initAudioContextOnce();
        if (this.audioContext && this.audioContext.state === 'suspended') this.audioContext.resume();
    }

    _onPause() {
        this.isPlaying = false;
        this.playBtn.textContent = '▶';
        cancelAnimationFrame(this.animationDraw);
    }

    _onEnded() {
        this.isPlaying = false;
        this.playBtn.textContent = '▶';
        this.next()
    }

    _setDuration() {
        const total = Math.floor(this.audio.duration || 0);
        this.durationEl.textContent = this._formatTime(total);
    }

    _updateProgress() {
        const cur = this.audio.currentTime || 0;
        const dur = this.audio.duration || 0;
        const pct = dur ? (cur / dur) * 100 : 0;
        this.progress.style.width = pct + '%';
        this.currentTimeEl.textContent = this._formatTime(Math.floor(cur));
    }

    _seek(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = Math.max(0, Math.min(1, x / rect.width));
        if (this.audio.duration) {
            this.audio.currentTime = pct * this.audio.duration;
        }
    }

    _setVolume() {
        const v = parseFloat(this.volumeSlider.value);
        this.audio.volume = v;
        this.previousVolume = v;
        if (v === 0) {
            this.volumeBtn.textContent = '🔇';
        } else if (v < 0.5) {
            this.volumeBtn.textContent = '🔈';
        } else {
            this.volumeBtn.textContent = '🔊';
        }
    }

    _toggleMute() {
        if (this.isMuted) {
            this.audio.volume = this.previousVolume || 1;
            this.volumeSlider.value = this.previousVolume || 1;
            this.isMuted = false;
            this._setVolume();
        } else {
            this.previousVolume = this.audio.volume;
            this.audio.volume = 0;
            this.volumeSlider.value = 0;
            this.isMuted = true;
            this.volumeBtn.textContent = '🔇';
        }
    }

    _formatTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    }

    // Visualizador
    _draw() {
        requestAnimationFrame(() => this._draw());
        const cw = this.canvas.clientWidth;
        const ch = this.canvas.clientHeight;
        this.ctx.clearRect(0, 0, cw, ch);

        if (!this.analyser || !this.dataArray) return;

        this.analyser.getByteFrequencyData(this.dataArray);

        const padding = 8;
        const usableH = ch - padding * 2;
        const centerY = ch / 2;
        const centerX = cw / 2;

        // Usamos solo la mitad de los datos para reflejar
        const halfBars = Math.floor(this.bufferLength / 2);
        const barWidth = Math.max((cw / 2 - padding) / halfBars - 1, 1);

        for (let i = 0; i < halfBars; i++) {
            const v = this.dataArray[i] / 255;
            const barH = v * usableH * 0.50;
            const alpha = 0.15 + v * 0.85;
            // 🎨 Color dinámico basado en intensidad
            const r = Math.floor(255 * v);           // Rojo más alto con volumen
            const g = 255;// Math.floor(255 * (1 - v));     // Verde inverso
            const b = 255;// 255;                           // Azul fijo (puedes ca 
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;

            // Derecha desde el centro
            const xRight = centerX + i * (barWidth + 1);
            this.ctx.fillRect(xRight, centerY - barH, barWidth, barH);
            this.ctx.fillRect(xRight, centerY, barWidth, barH * 0.6);

            // Izquierda reflejada
            const xLeft = centerX - (i + 1) * (barWidth + 1);
            this.ctx.fillRect(xLeft, centerY - barH, barWidth, barH);
            this.ctx.fillRect(xLeft, centerY, barWidth, barH * 0.6);
        }
    }

}
const player= new AudioPlayer();
function initAudio(){
    //inicializamos todo despues de agregar cada musica para que se puedan reproducir
    player.tracks = Array.from(document.querySelectorAll('.track'));
    player._bindEvents();
}
// Inicializar cuando DOM listo
document.addEventListener('DOMContentLoaded', () => {
    //initAudio();
    //const player= new AudioPlayer();
//function initAudio() {
    // Si quieres iniciar visualizador en cuanto haya user gesture, el player lo hará en play()
})

let isShowListMusic = false;

function mostrarLista() { 
    const listaInicio = document.getElementById("lista-musica");
    listaInicio.classList.remove("ocultarIni");
    if (isShowListMusic) {
        console.log(isShowListMusic)
        listaInicio.classList.remove("mostrarList");
        listaInicio.classList.add("ocultarConfig");
    } else {
        console.log(isShowListMusic)
        listaInicio.classList.add("mostrarList");
        listaInicio.classList.remove("ocultarConfig");
    }
    isShowListMusic = !isShowListMusic;
} 

//});