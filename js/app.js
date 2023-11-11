import * as THREE from "three";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import fragment from "./shader/fragment.glsl";
import vertex from "./shader/vertex.glsl";
import * as dat from "dat.gui";
import imagesLoaded from 'imagesloaded';
import gsap from 'gsap';
import FontFaceObserver from 'fontfaceobserver';
import ocean from '../assets/air-max-97-flat.png'
import Lenis from '@studio-freight/lenis'
import AirMaxFlat from '../assets/air-max-97-flat.png'
import AirZoomFlat from '../assets/air-zoom-20-flat.png'
import FlynKitFlat from '../assets/flynkit-flat.png'
import FreeRunFlat from '../assets/free-run-2-flat.png'
import PegasusFlat from '../assets/pegasus-32-flat.png'
import OutdoorFlat from '../assets/black-running.png'
import BlackNike from '../assets/blacknike.jpg'

export default class Sketch {
	constructor(options) {
		this.scene = new THREE.Scene();

		this.container = options.dom;
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
		this.renderer.setSize(this.width, this.height);
		// this.renderer.setClearColor(0xeeeeee, 1);

		this.container.appendChild(this.renderer.domElement);

		this.camera = new THREE.PerspectiveCamera(
			30,
			window.innerWidth / window.innerHeight,
			0.001,
			1000
		);

		// var frustumSize = 10;
		// var aspect = window.innerWidth / window.innerHeight;
		// this.camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, -1000, 1000 );
		// this.camera.position.set(0, 0, 2);
		this.camera.position.z = 600
		this.camera.fov = 2 * Math.atan((this.height / 2) / 600) * (180 / Math.PI);
		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.time = 0;
		this.images = [...document.querySelectorAll('img')];
		this.imagesFlat = [PegasusFlat, AirMaxFlat, AirZoomFlat, FlynKitFlat, FreeRunFlat, OutdoorFlat]
		this.isPlaying = true;
		this.currentScroll = 0;
		this.raycaster = new THREE.Raycaster();
		this.mouse = new THREE.Vector2();
		this.textures = [];

		const fontBebas = new Promise(resolve => {
			new FontFaceObserver("Bebas Neue").load().then(() => {
				resolve();
			});
		});

		const fontOswald = new Promise(resolve => {
			new FontFaceObserver("Oswald").load().then(() => {
				resolve();
			});
		});

		// Preload images
		const preloadImages = new Promise((resolve, reject) => {
			imagesLoaded(document.querySelectorAll("img"), { background: true }, resolve);
		});

		let allDone = [fontBebas, fontOswald, preloadImages]

		window.scrollTo(0, 0)

		Promise.all(allDone).then(() => {
			// this.addObjects();
			this.addImages();
			this.setPosition();
			this.createLenis();
			this.mouseMovement();
			this.resize();
			this.render();
			// this.setupResize();
			// this.settings();
		})

	}

	settings() {
		let that = this;
		this.settings = {
			progress: 0,
		};
		this.gui = new dat.GUI();
		this.gui.add(this.settings, "progress", 0, 1, 0.01);
	}

	mouseMovement() {


		window.addEventListener('mousemove', (event) => {
			this.mouse.x = (event.clientX / this.width) * 2 - 1;
			this.mouse.y = - (event.clientY / this.height) * 2 + 1;

			// update the picking ray with the camera and mouse position
			this.raycaster.setFromCamera(this.mouse, this.camera);

			// calculate objects intersecting the picking ray
			const intersects = this.raycaster.intersectObjects(this.scene.children);

			if (intersects.length > 0) {
				// console.log(intersects[0]);
				// let obj = intersects[0].object;
				// obj.material.uniforms.hover.value = intersects[0].uv;
			}


		}, false);
	}

	setupResize() {
		window.addEventListener("resize", this.resize.bind(this));
	}

	resize() {
		this.width = this.container.offsetWidth;
		this.height = this.container.offsetHeight;
		this.renderer.setSize(this.width, this.height);
		this.camera.aspect = this.width / this.height;

		// console.log(this.materials);

		// image cover
		// this.imageAspect = this.images[0].image.height / this.images[0].image.width;
		// let a1; let a2;
		// if (this.height / this.width > this.imageAspect) {
		// 	a1 = (this.width / this.height) * this.imageAspect;
		// 	a2 = 1;
		// } else {
		// 	a1 = 1;
		// 	a2 = (this.height / this.width) / this.imageAspect;
		// }

		// this.material.uniforms.resolution.value.x = this.width;
		// this.material.uniforms.resolution.value.y = this.height;
		// this.material.uniforms.resolution.value.z = a1;
		// this.material.uniforms.resolution.value.w = a2;
		this.camera.updateProjectionMatrix();
	}

	createLenis() {
		this.lenis = new Lenis({

			smooth: true,
		})
		this.currentScroll = 0;
		console.log('init', this.lenis.animatedScroll);

		this.lenis.on('scroll', (e) => {
			this.currentScroll = e.animatedScroll
			console.log('as=>', e.animatedScroll)
		})
		gsap.ticker.add((time) => {

			this.lenis.raf(time * 1000)

		})

		gsap.ticker.lagSmoothing(0)

	}

	addImages() {


		this.material = new THREE.ShaderMaterial({
			uniforms: {
				time: { value: 0 },
				uImage: { value: 0 },
				uImage2: { value: 0 },
				uUvScale: { value: new THREE.Vector2(1, 1) },
				uUvScale2: { value: new THREE.Vector2(1, 1) },
				hover: { value: new THREE.Vector2(0.5, 0.5) },
				hoverState: { value: 0 },
				resolution: { type: "v4", value: new THREE.Vector4() }
			},
			transparent: true,
			fragmentShader: fragment,
			vertexShader: vertex,
		})

		this.materials = [];

		this.imageStore = this.images.map((img, index) => {
			let bounds = img.getBoundingClientRect();
			// let geometry = new THREE.PlaneGeometry(bounds.width, bounds.height, 10, 10);

			// let image = new Image();
			// image.src = img.src;
			// let texture = new THREE.Texture(image);
			// texture.needsUpdate = true;

			// let material = this.material.clone();

			// this.materials.push(material);
			// material.uniforms.uImage.value = texture;
			let mesh;
			let geometry = new THREE.PlaneGeometry(200, 200, 1, 1);
			let image = new Image();
			let image2 = new Image();
			image.src = img.src;
			image2.src = this.imagesFlat[index];
			let texture = new THREE.Texture(image);
			let texture2 = new THREE.Texture(image2);
			// mesh.scale.set(1.0, texture.image.height / texture.image.width, 1.0);
			// mesh.scale.set(1.0, texture2.image.height / texture2.image.width, 1.0);
			texture.needsUpdate = true;
			texture2.needsUpdate = true;

			let material = this.material.clone();

			img.addEventListener('mouseenter', () => {
				gsap.to(material.uniforms.hoverState, {
					duration: 1,
					value: 1
				})
			})
			img.addEventListener('mouseout', () => {
				gsap.to(material.uniforms.hoverState, {
					duration: 1,
					value: 0
				})
			})

			this.materials.push(material);
			material.uniforms.uImage.value = texture;
			material.uniforms.uImage2.value = texture2;
			this.fixAspectRatio(texture, material.uniforms.uUvScale.value);
			this.fixAspectRatio(texture2, material.uniforms.uUvScale2.value);
			// console.log(this.imagesFlat[index])
			// this.geometry = new THREE.SphereBufferGeometry( 0.4, 40,40 );
			// this.material = new THREE.MeshNormalMaterial();

			// this.material = new THREE.ShaderMaterial({
			// 	uniforms: {
			// 		time: { value: 0 },
			// 		oceanTexture: { value: new THREE.TextureLoader().load(ocean) },
			// 	},
			// 	side: THREE.DoubleSide,
			// 	fragmentShader: fragment,
			// 	vertexShader: vertex,
			// 	// wireframe: true
			// })



			// this.mesh = new THREE.Mesh(this.geometry, this.material);

			mesh = new THREE.Mesh(geometry, material);

			this.scene.add(mesh);

			return {
				img: img,
				mesh: mesh,
				top: bounds.top,
				left: bounds.left,
				width: bounds.width,
				height: bounds.height
			}
		})

		// console.log(this.imageStore);
	}

	setPosition() {
		this.imageStore.forEach((o, index) => {
			console.log('cs=>', this.currentScroll);
			if (index == 0) {
				console.log('mesh y', o.top, this.height, o.height);
			}
			o.mesh.position.y = this.currentScroll - o.top + this.height / 2 - o.height / 2;
			// o.mesh.position.y = - o.top + this.height / 2 - o.height / 2;
			o.mesh.position.x = o.left - this.width / 2 + o.width / 2;
		})
	}

	fixAspectRatio(texture, material) {
		texture.matrixAutoUpdate = false;

		var aspect = 400 / 400;
		var imageAspect = texture.image.width / texture.image.height;
		material.set(1, imageAspect / aspect)
		// material.set(aspect / imageAspect, 1)
		// material.set(1, imageAspect / aspect)
		// if (aspect < imageAspect) {
		// 	material.set(aspect / imageAspect, 1)
		// } else {
		// 	material.set(1, imageAspect / aspect)
		// }
	}

	// addObjects() {
	//   let that = this;
	//   this.material = new THREE.ShaderMaterial({
	//     extensions: {
	//       derivatives: "#extension GL_OES_standard_derivatives : enable"
	//     },
	//     side: THREE.DoubleSide,
	//     uniforms: {
	//       time: { value: 0 },
	//       resolution: { value: new THREE.Vector4() },
	//     },
	//     // wireframe: true,
	//     // transparent: true,
	//     vertexShader: vertex,
	//     fragmentShader: fragment
	//   });

	//   this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

	//   this.plane = new THREE.Mesh(this.geometry, this.material);
	//   this.scene.add(this.plane);
	// }

	stop() {
		this.isPlaying = false;
	}

	play() {
		if (!this.isPlaying) {
			this.render()
			this.isPlaying = true;
		}
	}

	render() {
		if (!this.isPlaying) return;
		this.time += 0.05;

		this.setPosition();
		this.materials.forEach(m => {
			m.uniforms.time.value = this.time;
		})
		requestAnimationFrame(this.render.bind(this));
		// requestAnimationFrame(this.raf)
		this.renderer.render(this.scene, this.camera);
	}
}

new Sketch({
	dom: document.getElementById("container")
});
