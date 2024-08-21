import { fabric } from "fabric";
import { hsvToRgb, rgbToHsv } from "./utils";

export const HueShiftFilter = fabric.util.createClass(fabric.Image.filters.BaseFilter,{
    type: 'HueShiftFilter',

    fragmentSource: 'precision highp float;\n'+
    'uniform sampler2D uTexture;\n'+
    'uniform float uHueShift;\n'+
    'uniform float uHueStart;\n'+
    'uniform float uHueEnd;\n'+
    'varying vec2 vTexCoord;\n'+
    'uniform float uSaturationShift;\n'+
    'uniform float uBrightnessShift;\n'+
    'vec3 rgb2hsv(vec3 c) {\n'+
        'vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);\n'+
        'vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));\n'+
        'vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));\n'+
        'float d = q.x - min(q.w, q.y);\n'+
        'float e = 1.0e-10;\n'+
        'return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);\n'+
    '}\n'+
    'vec3 hsv2rgb(vec3 c) {\n'+
        'vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);\n'+
        'vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);\n'+
        'return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);\n'+
    '}\n'+

    'bool isInRange(float hue, float start, float end) {\n'+
        '// Normalize start, end, and hue to be within 0 to 360 degrees\n'+
        'start = mod(start, 1.0);\n'+
        'end = mod(end, 1.0);\n'+
        'hue = mod(hue, 1.0);\n'+
    
        'if (start <= end) {\n'+
            'return hue >= start && hue <= end;\n'+
        '} else {\n'+
            '// Adjust for wrapping around 1.0\n'+
            'return hue >= start || hue <= end;\n'+
        '}\n'+
    '}\n'+

    'void main() {\n'+
        'vec4 color = texture2D(uTexture, vTexCoord);\n'+
        'vec3 hsv = rgb2hsv(color.rgb);\n'+
        
        'if (isInRange(hsv.x, uHueStart, uHueEnd)) {\n'+
            'hsv.x += uHueShift;\n'+
            'hsv.y = clamp(hsv.y + uSaturationShift, 0.0, 1.0);\n'+
            'hsv.z = clamp(hsv.z + uBrightnessShift, 0.0, 1.0);\n'+
            'hsv.x = fract(hsv.x);  // ensure hue is [0, 1]\n'+
        '}\n'+
    
        'color.rgb = hsv2rgb(hsv);\n'+
        'gl_FragColor = color;\n'+
    '}',
  
    initialize: function(options) {
      options = options || {};
      this.hueStart = options.hueStart || 0;
      this.hueEnd = options.hueEnd || 45;
      this.hueShift = options.hueShift || 0;
      this.saturationShift = options.saturationShift || 0;
      this.brightnessShift = options.brightnessShift || 0;
    },
    
    applyTo2d: function(options) {
        var imageData = options.imageData;
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
            let r = data[i] / 255;
            let g = data[i + 1] / 255;
            let b = data[i + 2] / 255;
    
            let [h, s, v] = rgbToHsv(r, g, b);

            if (h * 360 >= this.hueStart && h * 360 <= this.hueEnd) {
                h = (h + (this.hueShift / 360)) % 1;
                s = Math.min(Math.max(s + this.saturationShift, 0), 1); 
                v = Math.min(Math.max(v + this.brightnessShift, 0), 1); 
            }

            [r, g, b] = hsvToRgb(h, s, v);
    
            data[i] = r * 255;
            data[i + 1] = g * 255;
            data[i + 2] = b * 255;    
        }
    },

    isNeutralState: function() {
        return false;
    },

    getUniformLocations: function(gl, program) {
        return {
            uHueShift: gl.getUniformLocation(program, 'uHueShift'),
            uHueStart: gl.getUniformLocation(program, 'uHueStart'),
            uHueEnd: gl.getUniformLocation(program, 'uHueEnd'),
            uSaturationShift: gl.getUniformLocation(program, 'uSaturationShift'),
            uBrightnessShift: gl.getUniformLocation(program, 'uBrightnessShift'),
        };
    },

    sendUniformData: function(gl, uniformLocations) {
        gl.uniform1f(uniformLocations.uHueShift, this.hueShift / 360.0);
        gl.uniform1f(uniformLocations.uHueStart, this.hueStart / 360.0);
        gl.uniform1f(uniformLocations.uHueEnd, this.hueEnd / 360.0);
        gl.uniform1f(uniformLocations.uSaturationShift, this.saturationShift);
        gl.uniform1f(uniformLocations.uBrightnessShift, this.brightnessShift);
    },

});