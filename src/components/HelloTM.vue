<template>
  <div class="helloTM">
    <div>
      <div class="gif-upload-form">
        Upload an gif file:
        <input name="gif" type="file" @change="previewGif" accept="image/gif">
      </div>
      <div v-if="gifData.length > 0">
        <img :src="gifData">
      </div>

      <div class="img-upload-form">
        Upload an img file:
        <input name="img" type="file" @change="previewImage" accept="image/png, image/jpeg">
      </div>
      <div v-if="imageData.length > 0">
        <img id='img' :src="imageData">
      </div>

      <div id='canvas' @mousedown="canvasOnMouseDown" @mousemove="canvasOnMouseMove" @mouseup="canvasOnMouseUp" >
        <img @load="previewOnLoad" id='preview' ondragstart="return false;">
      </div>
      {{preview}}
      {{preview.length}}  
      <button v-on:click="processImage">Submit</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'helloTM',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App',
      gifData: '',
      imageData: '',
      blobData: '',
      preview: '',
      imgIndex: 0,
      mouse: {
        x: 0,
        y: 0,
        startX: 0,
        startY: 0
      },
      element: null,
      isMove: false
    }
  },
  methods: {
    currentMouse: function (e) {
      var c = document.getElementById('canvas')
      var rect = c.getBoundingClientRect()
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    },
    previewOnLoad: function () {
      var c = document.getElementById('canvas')
      var preivewImg = document.getElementById('preview')
      c.style.width = preivewImg.width + 'px'
      c.style.height = preivewImg.height + 'px'
    },
    previewImage: function (event) {
      var input = event.target
      if (input.files && input.files[0]) {
        var reader = new FileReader()
        reader.onload = (e) => {
          this.imageData = e.target.result
        }
        reader.readAsDataURL(input.files[0])
      }
    },
    previewGif: function (event) {
      // Reference to the DOM input element
      var input = event.target
      // Ensure that you have a file before attempting to read it
      if (input.files && input.files[0]) {
        // create a new FileReader to read this image and convert to base64 format
        var reader = new FileReader()
        // Define a callback function to run, when FileReader finishes its job
        reader.onload = (e) => {
          // Note: arrow function used here, so that "this.imageData" refers to the imageData of Vue component
          // Read image as base64 and set to imageData
          this.gifData = e.target.result
          this.blobData = new FormData()
          this.blobData.append('img', this.dataURItoBlob(this.gifData))
          this.$http.post('http://127.0.0.1:5000/api/getGifReview', this.blobData).then(response => {
            this.preview = response.body
            document.getElementById('preview').src = this.preview[this.imgIndex].gif
          }, response => {
            // error callback
          })
        }
        // Start the reader job - read file as a data url (base64 format)
        reader.readAsDataURL(input.files[0])
      }
    },
    processImage: function (event) {
      var div = document.getElementById('rect')
      this.$http.put('http://127.0.0.1:5000/api/processImage' + '/' + div.style.left + '/' + div.style.top + '/' + div.offsetWidth + '/' + div.offsetHeight, this.blobData).then(response => {
        // this.preview = response.body
      }, response => {
        // error callback
      })
    },
    dataURItoBlob: function (dataURI) {
      var byteString = atob(dataURI.split(',')[1])
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0]
      var ab = new ArrayBuffer(byteString.length)
      var ia = new Uint8Array(ab)
      for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      return new Blob([ab], {type: mimeString})
    },
    canvasOnMouseMove: function (e) {
      if (this.element !== null && this.isMove) {
        this.element.style.width = Math.abs(this.currentMouse(e).x - this.mouse.startX) + 'px'
        this.element.style.height = Math.abs(this.currentMouse(e).y - this.mouse.startY) + 'px'
        this.element.style.left = (this.currentMouse(e).x - this.mouse.startX < 0) ? this.currentMouse(e).x + 'px' : this.mouse.startX + 'px'
        this.element.style.top = (this.currentMouse(e).y - this.mouse.startY < 0) ? this.currentMouse(e).y + 'px' : this.mouse.startY + 'px'
      }
    },
    canvasOnMouseDown: function (e) {
      if (this.imgIndex < this.preview.length) {
        if (this.element === null) {
          this.element = document.createElement('div')
          var c = document.getElementById('canvas')
          this.element.id = 'rect'
          this.element.style.cssText = 'border: 1px solid #FF0000;position: absolute;'
          c.appendChild(this.element)
          console.log(c)
        } else {
          this.element.style.width = 0
          this.element.style.height = 0
        }
        if (!this.isMove) {
          this.mouse.startX = this.currentMouse(e).x
          this.mouse.startY = this.currentMouse(e).y
          this.mouse.x = this.currentMouse(e).x
          this.mouse.y = this.currentMouse(e).y
          this.element.style.left = this.mouse.x + 'px'
          this.element.style.top = this.mouse.y + 'px'
          this.isMove = true
        }
      }
    },
    canvasOnMouseUp: function (e) {
      if (this.isMove) {
        var img = document.getElementById('img')
        var div = document.getElementById('rect')
        this.isMove = false
        this.preview[this.imgIndex].x = parseInt(div.style.left.replace('px', ''))
        this.preview[this.imgIndex].y = parseInt(div.style.top.replace('px', ''))
        this.preview[this.imgIndex].width = img.offsetWidth
        this.preview[this.imgIndex].height = img.offsetHeight
        if ((this.imgIndex + 1) < this.preview.length) {
          this.imgIndex += 1
          document.getElementById('preview').src = this.preview[this.imgIndex].gif
          document.getElementById('canvas').removeChild(div)
          this.element = null
        }
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

#canvas {
  border: 1px solid #000000;
  background: white;
  position: relative;
}
</style>
