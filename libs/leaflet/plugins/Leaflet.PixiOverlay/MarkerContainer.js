// Monkey patching particle renderer for:
// - limiting RAM usage (around 10 times less)
// - customizing to our target: we want to render markers (e.g. scale is now a uniform)
// Hope one day i'll have some times for a better solution

var ParticleContainer = PIXI.particles.ParticleContainer;
var ParticleRenderer = PIXI.particles.ParticleRenderer;
var utils = PIXI.utils;

ParticleContainer.prototype.addChild = function(child) {
    var argumentsLength = arguments.length;

    // if there is only one argument we can bypass looping through the them
    if (argumentsLength > 1) {
        // loop through the arguments property and add all children
        // use it the right way (.length and [i]) so that this function can still be optimised by JS runtimes
        for (var i = 0; i < argumentsLength; i++) {
            this.addChild(arguments[i]);
        }
    } else {
        this.children.push(child);

        // ensure bounds will be recalculated
        this._boundsID++;

        // TODO - lets either do all callbacks or all events.. not both!
        this.onChildrenChange(this.children.length - 1);
        // child.emit('added', this);
    }

    return child;
};

ParticleContainer.prototype.setProperties = function(properties) {
    this._properties = [false, true];
    if (properties) {
        this._properties[0] =
            'vertices' in properties || 'scale' in properties
                ? !!properties.vertices || !!properties.scale
                : this._properties[0];
        this._properties[1] = 'position' in properties ? !!properties.position : this._properties[1];
    }
};

ParticleRenderer.prototype.onContextChange = function() {
    const gl = this.renderer.gl;

    this.CONTEXT_UID = this.renderer.CONTEXT_UID;

    // setup default shader
    this.shader = new PIXI.Shader(
        gl,
        [
            'attribute vec2 aVertexPosition;',
            'attribute vec2 aTextureCoord;',

            'attribute vec2 aPositionCoord;',
            'uniform float scale;',

            'uniform mat3 projectionMatrix;',

            'varying vec2 vTextureCoord;',

            'void main(void){',

            '   vec2 v = scale * aVertexPosition + aPositionCoord;',

            '   gl_Position = vec4((projectionMatrix * vec3(v, 1.0)).xy, 0.0, 1.0);',

            '   vTextureCoord = aTextureCoord;',
            '}'
        ].join('\n'),
        [
            'varying vec2 vTextureCoord;',

            'uniform sampler2D uSampler;',

            'void main(void){',
            '  vec4 color = texture2D(uSampler, vTextureCoord);',
            '  gl_FragColor = color;',
            '}'
        ].join('\n')
    );

    this.properties = [
        // verticesData
        {
            attribute: this.shader.attributes.aVertexPosition,
            size: 2,
            uploadFunction: this.uploadVertices.bind(this),
            offset: 0
        },
        // positionData
        {
            attribute: this.shader.attributes.aPositionCoord,
            size: 2,
            uploadFunction: this.uploadPosition,
            offset: 0
        },
        // uvsData
        {
            attribute: this.shader.attributes.aTextureCoord,
            size: 2,
            uploadFunction: this.uploadUvs.bind(this),
            offset: 0
        }
    ];
};

ParticleRenderer.prototype.render = function(container) {
    const children = container.children;
    const texture = container.texture;
    const maxSize = container._maxSize;
    const batchSize = container._batchSize;
    const renderer = this.renderer;
    let totalChildren = children.length;

    if (totalChildren === 0) {
        return;
    } else if (totalChildren > maxSize) {
        totalChildren = maxSize;
    }

    let buffers = container._glBuffers[renderer.CONTEXT_UID];

    if (!buffers) {
        buffers = container._glBuffers[renderer.CONTEXT_UID] = this.generateBuffers(container);
    }

    this.texture = texture;
    this.anchor = container.anchor;
    const baseTexture = texture.baseTexture;

    // if the uvs have not updated then no point rendering just yet!
    // this.renderer.setBlendMode(utils.correctBlendMode(container.blendMode, baseTexture.premultipliedAlpha));
    this.renderer.setBlendMode(0);

    const gl = renderer.gl;

    const m = container.worldTransform.copy(this.tempMatrix);

    m.prepend(renderer._activeRenderTarget.projectionMatrix);

    this.shader.uniforms.projectionMatrix = m.toArray(true);

    // make sure the texture is bound..
    this.shader.uniforms.uSampler = renderer.bindTexture(baseTexture);

    this.shader.uniforms.scale = container.localScale;

    let updateStatic = false;

    // now lets upload and render the buffers..
    for (let i = 0, j = 0; i < totalChildren; i += batchSize, j += 1) {
        let amount = totalChildren - i;

        if (amount > batchSize) {
            amount = batchSize;
        }

        if (j >= buffers.length) {
            if (!container.autoResize) {
                break;
            }
            buffers.push(this._generateOneMoreBuffer(container));
        }

        const buffer = buffers[j];

        // we always upload the dynamic
        buffer.uploadDynamic(children, i, amount);

        const bid = container._bufferUpdateIDs[i] || 0;

        updateStatic = updateStatic || buffer._updateID < bid;
        // we only upload the static content when we have to!
        if (updateStatic) {
            buffer._updateID = container._updateID;
            buffer.uploadStatic(children, i, amount);
        }

        // bind the buffer
        renderer.bindVao(buffer.vao);
        buffer.vao.draw(gl.TRIANGLES, amount * 6);
    }
};

ParticleRenderer.prototype.uploadVertices = function(children, startIndex, amount, array, stride, offset) {
    let w0 = 0;
    let w1 = 0;
    let h0 = 0;
    let h1 = 0;

    const anchor = this.anchor;
    const texture = this.texture;
    const trim = texture.trim;
    const orig = texture.orig;

    for (let i = 0; i < amount; ++i) {
        if (trim) {
            // if the sprite is trimmed and is not a tilingsprite then we need to add the
            // extra space before transforming the sprite coords..
            w1 = trim.x - anchor.x * orig.width;
            w0 = w1 + trim.width;

            h1 = trim.y - anchor.y * orig.height;
            h0 = h1 + trim.height;
        } else {
            w0 = orig.width * (1 - anchor.x);
            w1 = orig.width * -anchor.x;

            h0 = orig.height * (1 - anchor.y);
            h1 = orig.height * -anchor.y;
        }

        array[offset] = w1;
        array[offset + 1] = h1;

        array[offset + stride] = w0;
        array[offset + stride + 1] = h1;

        array[offset + stride * 2] = w0;
        array[offset + stride * 2 + 1] = h0;

        array[offset + stride * 3] = w1;
        array[offset + stride * 3 + 1] = h0;

        offset += stride * 4;
    }
};

ParticleRenderer.prototype.uploadPosition = function(children, startIndex, amount, array, stride, offset) {
    for (let i = 0; i < amount; i++) {
        const spritePosition = children[startIndex + i];

        array[offset] = spritePosition.x;
        array[offset + 1] = spritePosition.y;

        array[offset + stride] = spritePosition.x;
        array[offset + stride + 1] = spritePosition.y;

        array[offset + stride * 2] = spritePosition.x;
        array[offset + stride * 2 + 1] = spritePosition.y;

        array[offset + stride * 3] = spritePosition.x;
        array[offset + stride * 3 + 1] = spritePosition.y;

        offset += stride * 4;
    }
};

ParticleRenderer.prototype.uploadUvs = function(children, startIndex, amount, array, stride, offset) {
    const textureUvs = this.texture._uvs;

    for (let i = 0; i < amount; ++i) {
        if (textureUvs) {
            array[offset] = textureUvs.x0;
            array[offset + 1] = textureUvs.y0;

            array[offset + stride] = textureUvs.x1;
            array[offset + stride + 1] = textureUvs.y1;

            array[offset + stride * 2] = textureUvs.x2;
            array[offset + stride * 2 + 1] = textureUvs.y2;

            array[offset + stride * 3] = textureUvs.x3;
            array[offset + stride * 3 + 1] = textureUvs.y3;

            offset += stride * 4;
        } else {
            // TODO you know this can be easier!
            array[offset] = 0;
            array[offset + 1] = 0;

            array[offset + stride] = 0;
            array[offset + stride + 1] = 0;

            array[offset + stride * 2] = 0;
            array[offset + stride * 2 + 1] = 0;

            array[offset + stride * 3] = 0;
            array[offset + stride * 3 + 1] = 0;

            offset += stride * 4;
        }
    }
};
