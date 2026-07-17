!function (e, t, n) {
    function i(n, s) {
        if (!t[n]) {
            if (!e[n]) {
                var o = typeof require == "function" && require;
                if (!s && o) return o(n, !0);
                if (r) return r(n, !0);
                throw new Error("Cannot find module '" + n + "'");
            }

            var u = t[n] = { exports: {} };

            e[n][0].call(
                u.exports,
                function (t) {
                    var r = e[n][1][t];
                    return i(r ? r : t);
                },
                u,
                u.exports
            );
        }

        return t[n].exports;
    }

    var r = typeof require == "function" && require;

    for (var s = 0; s < n.length; s++) i(n[s]);

    return i;
}({
    1: [
        function (require, module, exports) {
            var VerletJS = require("./verlet");
            var constraint = require("./constraint");

            require("./objects");

            window.Vec2 = require("./vec2");
            window.VerletJS = VerletJS;
            window.Particle = VerletJS.Particle;
            window.DistanceConstraint = constraint.DistanceConstraint;
            window.PinConstraint = constraint.PinConstraint;
            window.AngleConstraint = constraint.AngleConstraint;
        },
        {
            "./verlet": 2,
            "./constraint": 3,
            "./objects": 4,
            "./vec2": 5
        }
    ],

    3: [
        function (require, module, exports) {
            exports.DistanceConstraint = DistanceConstraint;
            exports.PinConstraint = PinConstraint;
            exports.AngleConstraint = AngleConstraint;

            function DistanceConstraint(a, b, stiffness, distance) {
                this.a = a;
                this.b = b;
                this.distance =
                    typeof distance != "undefined"
                        ? distance
                        : a.pos.sub(b.pos).length();
                this.stiffness = stiffness;
            }

            DistanceConstraint.prototype.relax = function (stepCoef) {
                var normal = this.a.pos.sub(this.b.pos);
                var m = normal.length2();

                normal.mutableScale(
                    (this.distance * this.distance - m) / m * this.stiffness * stepCoef
                );

                this.a.pos.mutableAdd(normal);
                this.b.pos.mutableSub(normal);
            };

            DistanceConstraint.prototype.draw = function (ctx) {
                ctx.beginPath();
                ctx.moveTo(this.a.pos.x, this.a.pos.y);
                ctx.lineTo(this.b.pos.x, this.b.pos.y);
                ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--web-color').trim() || "#ffffff";
                ctx.lineWidth = 2;
                ctx.stroke();
            };

            function PinConstraint(a, pos) {
                this.a = a;
                this.pos = (new Vec2()).mutableSet(pos);
            }

            PinConstraint.prototype.relax = function (stepCoef) {
                this.a.pos.mutableSet(this.pos);
            };

            PinConstraint.prototype.draw = function (ctx) {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, 6, 0, 2 * Math.PI);
                ctx.fillStyle = "rgba(0,153,255,0.1)";
                ctx.fill();
            };

            function AngleConstraint(a, b, c, stiffness) {
                this.a = a;
                this.b = b;
                this.c = c;
                this.angle = this.b.pos.angle2(this.a.pos, this.c.pos);
                this.stiffness = stiffness;
            }

            AngleConstraint.prototype.relax = function (stepCoef) {
                var angle = this.b.pos.angle2(this.a.pos, this.c.pos);
                var diff = angle - this.angle;

                if (diff <= -Math.PI) {
                    diff += 2 * Math.PI;
                } else if (diff >= Math.PI) {
                    diff -= 2 * Math.PI;
                }

                diff *= stepCoef * this.stiffness;

                this.a.pos = this.a.pos.rotate(this.b.pos, diff);
                this.c.pos = this.c.pos.rotate(this.b.pos, -diff);
                this.b.pos = this.b.pos.rotate(this.a.pos, diff);
                this.b.pos = this.b.pos.rotate(this.c.pos, -diff);
            };

            AngleConstraint.prototype.draw = function (ctx) {
                ctx.beginPath();
                ctx.moveTo(this.a.pos.x, this.a.pos.y);
                ctx.lineTo(this.b.pos.x, this.b.pos.y);
                ctx.lineTo(this.c.pos.x, this.c.pos.y);

                var tmp = ctx.lineWidth;
                ctx.lineWidth = 5;
                ctx.strokeStyle = "rgba(255,255,0,0.2)";
                ctx.stroke();
                ctx.lineWidth = tmp;
            };
        },
        {}
    ],

    5: [
        function (require, module, exports) {
            module.exports = Vec2;

            function Vec2(x, y) {
                this.x = x || 0;
                this.y = y || 0;
            }

            Vec2.prototype.add = function (v) {
                return new Vec2(this.x + v.x, this.y + v.y);
            };

            Vec2.prototype.sub = function (v) {
                return new Vec2(this.x - v.x, this.y - v.y);
            };

            Vec2.prototype.mul = function (v) {
                return new Vec2(this.x * v.x, this.y * v.y);
            };

            Vec2.prototype.div = function (v) {
                return new Vec2(this.x / v.x, this.y / v.y);
            };

            Vec2.prototype.scale = function (coef) {
                return new Vec2(this.x * coef, this.y * coef);
            };

            Vec2.prototype.mutableSet = function (v) {
                this.x = v.x;
                this.y = v.y;
                return this;
            };

            Vec2.prototype.mutableAdd = function (v) {
                this.x += v.x;
                this.y += v.y;
                return this;
            };

            Vec2.prototype.mutableSub = function (v) {
                this.x -= v.x;
                this.y -= v.y;
                return this;
            };

            Vec2.prototype.mutableMul = function (v) {
                this.x *= v.x;
                this.y *= v.y;
                return this;
            };

            Vec2.prototype.mutableDiv = function (v) {
                this.x /= v.x;
                this.y /= v.y;
                return this;
            };

            Vec2.prototype.mutableScale = function (coef) {
                this.x *= coef;
                this.y *= coef;
                return this;
            };

            Vec2.prototype.equals = function (v) {
                return this.x == v.x && this.y == v.y;
            };

            Vec2.prototype.epsilonEquals = function (v, epsilon) {
                return (
                    Math.abs(this.x - v.x) <= epsilon &&
                    Math.abs(this.y - v.y) <= epsilon
                );
            };

            Vec2.prototype.length = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y);
            };

            Vec2.prototype.length2 = function () {
                return this.x * this.x + this.y * this.y;
            };

            Vec2.prototype.dist = function (v) {
                return Math.sqrt(this.dist2(v));
            };

            Vec2.prototype.dist2 = function (v) {
                var x = v.x - this.x;
                var y = v.y - this.y;
                return x * x + y * y;
            };

            Vec2.prototype.normal = function () {
                var m = Math.sqrt(this.x * this.x + this.y * this.y);
                return new Vec2(this.x / m, this.y / m);
            };

            Vec2.prototype.dot = function (v) {
                return this.x * v.x + this.y * v.y;
            };

            Vec2.prototype.angle = function (v) {
                return Math.atan2(
                    this.x * v.y - this.y * v.x,
                    this.x * v.x + this.y * v.y
                );
            };

            Vec2.prototype.angle2 = function (vLeft, vRight) {
                return vLeft.sub(this).angle(vRight.sub(this));
            };

            Vec2.prototype.rotate = function (origin, theta) {
                var x = this.x - origin.x;
                var y = this.y - origin.y;

                return new Vec2(
                    x * Math.cos(theta) - y * Math.sin(theta) + origin.x,
                    x * Math.sin(theta) + y * Math.cos(theta) + origin.y
                );
            };

            Vec2.prototype.toString = function () {
                return "(" + this.x + ", " + this.y + ")";
            };

            function test_Vec2() {
                var assert = function (label, expression) {
                    console.log(
                        "Vec2(" + label + "): " + (expression == true ? "PASS" : "FAIL")
                    );
                    if (expression != true) throw "assertion failed";
                };

                assert("equality", new Vec2(5, 3).equals(new Vec2(5, 3)));
                assert(
                    "epsilon equality",
                    new Vec2(1, 2).epsilonEquals(new Vec2(1.01, 2.02), 0.03)
                );
                assert(
                    "epsilon non-equality",
                    !new Vec2(1, 2).epsilonEquals(new Vec2(1.01, 2.02), 0.01)
                );
                assert(
                    "addition",
                    new Vec2(1, 1).add(new Vec2(2, 3)).equals(new Vec2(3, 4))
                );
                assert(
                    "subtraction",
                    new Vec2(4, 3).sub(new Vec2(2, 1)).equals(new Vec2(2, 2))
                );
                assert(
                    "multiply",
                    new Vec2(2, 4).mul(new Vec2(2, 1)).equals(new Vec2(4, 4))
                );
                assert(
                    "divide",
                    new Vec2(4, 2).div(new Vec2(2, 2)).equals(new Vec2(2, 1))
                );
                assert(
                    "scale",
                    new Vec2(4, 3).scale(2).equals(new Vec2(8, 6))
                );
                assert(
                    "mutable set",
                    new Vec2(1, 1).mutableSet(new Vec2(2, 3)).equals(new Vec2(2, 3))
                );
                assert(
                    "mutable addition",
                    new Vec2(1, 1).mutableAdd(new Vec2(2, 3)).equals(new Vec2(3, 4))
                );
                assert(
                    "mutable subtraction",
                    new Vec2(4, 3).mutableSub(new Vec2(2, 1)).equals(new Vec2(2, 2))
                );
                assert(
                    "mutable multiply",
                    new Vec2(2, 4).mutableMul(new Vec2(2, 1)).equals(new Vec2(4, 4))
                );
                assert(
                    "mutable divide",
                    new Vec2(4, 2).mutableDiv(new Vec2(2, 2)).equals(new Vec2(2, 1))
                );
                assert(
                    "mutable scale",
                    new Vec2(4, 3).mutableScale(2).equals(new Vec2(8, 6))
                );
                assert("length", Math.abs(new Vec2(4, 4).length() - 5.65685) <= 1e-5);
                assert("length2", new Vec2(2, 4).length2() == 20);
                assert(
                    "dist",
                    Math.abs(new Vec2(2, 4).dist(new Vec2(3, 5)) - 1.4142135) <= 1e-6
                );
                assert("dist2", new Vec2(2, 4).dist2(new Vec2(3, 5)) == 2);

                var normal = new Vec2(2, 4).normal();
                assert(
                    "normal",
                    Math.abs(normal.length() - 1) <= 1e-5 &&
                    normal.epsilonEquals(new Vec2(0.4472, 0.89443), 1e-4)
                );

                assert("dot", new Vec2(2, 3).dot(new Vec2(4, 1)) == 11);
                assert(
                    "angle",
                    new Vec2(0, -1).angle(new Vec2(1, 0)) * (180 / Math.PI) == 90
                );
                assert(
                    "angle2",
                    new Vec2(1, 1).angle2(new Vec2(1, 0), new Vec2(2, 1)) *
                    (180 / Math.PI) ==
                    90
                );
                assert(
                    "rotate",
                    new Vec2(2, 0).rotate(new Vec2(1, 0), Math.PI / 2).equals(
                        new Vec2(1, 1)
                    )
                );
                assert("toString", new Vec2(2, 4) == "(2, 4)");
            }
        },
        {}
    ],

    4: [
        function (require, module, exports) {
            var VerletJS = require("./verlet");
            var Particle = VerletJS.Particle;
            var constraints = require("./constraint");
            var DistanceConstraint = constraints.DistanceConstraint;

            VerletJS.prototype.point = function (pos) {
                var composite = new this.Composite();
                composite.particles.push(new Particle(pos));
                this.composites.push(composite);
                return composite;
            };

            VerletJS.prototype.lineSegments = function (vertices, stiffness) {
                var i;
                var composite = new this.Composite();

                for (i in vertices) {
                    composite.particles.push(new Particle(vertices[i]));
                    if (i > 0) {
                        composite.constraints.push(
                            new DistanceConstraint(
                                composite.particles[i],
                                composite.particles[i - 1],
                                stiffness
                            )
                        );
                    }
                }

                this.composites.push(composite);
                return composite;
            };

            VerletJS.prototype.cloth = function (
                origin,
                width,
                height,
                segments,
                pinMod,
                stiffness
            ) {
                var composite = new this.Composite();
                var xStride = width / segments;
                var yStride = height / segments;
                var x, y;

                for (y = 0; y < segments; ++y) {
                    for (x = 0; x < segments; ++x) {
                        var px = origin.x + x * xStride - width / 2 + xStride / 2;
                        var py = origin.y + y * yStride - height / 2 + yStride / 2;

                        composite.particles.push(new Particle(new Vec2(px, py)));

                        if (x > 0) {
                            composite.constraints.push(
                                new DistanceConstraint(
                                    composite.particles[y * segments + x],
                                    composite.particles[y * segments + x - 1],
                                    stiffness
                                )
                            );
                        }

                        if (y > 0) {
                            composite.constraints.push(
                                new DistanceConstraint(
                                    composite.particles[y * segments + x],
                                    composite.particles[(y - 1) * segments + x],
                                    stiffness
                                )
                            );
                        }
                    }
                }

                for (x = 0; x < segments; ++x) {
                    if (x % pinMod == 0) composite.pin(x);
                }

                this.composites.push(composite);
                return composite;
            };

            VerletJS.prototype.tire = function (
                origin,
                radius,
                segments,
                spokeStiffness,
                treadStiffness
            ) {
                var stride = 2 * Math.PI / segments;
                var i;
                var composite = new this.Composite();

                for (i = 0; i < segments; ++i) {
                    var theta = i * stride;
                    composite.particles.push(
                        new Particle(
                            new Vec2(
                                origin.x + Math.cos(theta) * radius,
                                origin.y + Math.sin(theta) * radius
                            )
                        )
                    );
                }

                var center = new Particle(origin);
                composite.particles.push(center);

                for (i = 0; i < segments; ++i) {
                    composite.constraints.push(
                        new DistanceConstraint(
                            composite.particles[i],
                            composite.particles[(i + 1) % segments],
                            treadStiffness
                        )
                    );
                    composite.constraints.push(
                        new DistanceConstraint(
                            composite.particles[i],
                            center,
                            spokeStiffness
                        )
                    );
                    composite.constraints.push(
                        new DistanceConstraint(
                            composite.particles[i],
                            composite.particles[(i + 5) % segments],
                            treadStiffness
                        )
                    );
                }

                this.composites.push(composite);
                return composite;
            };
        },
        {
            "./verlet": 2,
            "./constraint": 3
        }
    ],

    2: [
        function (require, module, exports) {
            window.requestAnimFrame =
                window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                window.oRequestAnimationFrame ||
                window.msRequestAnimationFrame ||
                function (callback) {
                    window.setTimeout(callback, 1000 / 60);
                };

            var Vec2 = require("./vec2");

            exports = module.exports = VerletJS;
            exports.Particle = Particle;
            exports.Composite = Composite;

            function Particle(pos) {
                this.pos = (new Vec2()).mutableSet(pos);
                this.lastPos = (new Vec2()).mutableSet(pos);
            }

            Particle.prototype.draw = function (ctx) {
                ctx.beginPath();
                ctx.arc(this.pos.x, this.pos.y, 2, 0, 2 * Math.PI);
                ctx.fillStyle = "#2dad8f";
                ctx.fill();
            };

            function VerletJS(width, height, canvas) {
                this.width = width;
                this.height = height;
                this.canvas = canvas;
                this.ctx = canvas.getContext("2d");
                this.mouse = new Vec2(0, 0);
                this.mouseDown = false;
                this.draggedEntity = null;
                this.selectionRadius = 20;
                this.highlightColor = "#4f545c";

                this.bounds = function (particle) {};

                var _this = this;

                this.canvas.oncontextmenu = function (e) {
                    e.preventDefault();
                };

                this.canvas.onmousedown = function (e) {
                    _this.mouseDown = true;
                    var nearest = _this.nearestEntity();
                    if (nearest) {
                        _this.draggedEntity = nearest;
                    }
                };

                this.canvas.onmouseup = function (e) {
                    _this.mouseDown = false;
                    _this.draggedEntity = null;
                };

                this.canvas.onmousemove = function (e) {
                    var rect = _this.canvas.getBoundingClientRect();
                    _this.mouse.x = e.clientX - rect.left;
                    _this.mouse.y = e.clientY - rect.top;
                };

                this.gravity = new Vec2(0, 0.2);
                this.friction = 0.99;
                this.groundFriction = 0.8;
                this.composites = [];
            }

            VerletJS.prototype.Composite = Composite;

            function Composite() {
                this.particles = [];
                this.constraints = [];
                this.drawParticles = null;
                this.drawConstraints = null;
            }

            Composite.prototype.pin = function (index, pos) {
                pos = pos || this.particles[index].pos;
                var pc = new PinConstraint(this.particles[index], pos);
                this.constraints.push(pc);
                return pc;
            };

            VerletJS.prototype.frame = function (step) {
                var i, j, c;

                for (c in this.composites) {
                    for (i in this.composites[c].particles) {
                        var particles = this.composites[c].particles;
                        var velocity = particles[i].pos
                            .sub(particles[i].lastPos)
                            .scale(this.friction);

                        if (
                            particles[i].pos.y >= this.height - 1 &&
                            velocity.length2() > 1e-6
                        ) {
                            var m = velocity.length();
                            velocity.x /= m;
                            velocity.y /= m;
                            velocity.mutableScale(m * this.groundFriction);
                        }

                        particles[i].lastPos.mutableSet(particles[i].pos);
                        particles[i].pos.mutableAdd(this.gravity);
                        particles[i].pos.mutableAdd(velocity);
                    }
                }

                if (this.draggedEntity) this.draggedEntity.pos.mutableSet(this.mouse);

                var stepCoef = 1 / step;

                for (c in this.composites) {
                    var constraints = this.composites[c].constraints;
                    for (i = 0; i < step; ++i) {
                        for (j in constraints) constraints[j].relax(stepCoef);
                    }
                }

                for (c in this.composites) {
                    var particles = this.composites[c].particles;
                    for (i in particles) this.bounds(particles[i]);
                }
            };

            VerletJS.prototype.draw = function () {
                var i, c;
                this.ctx.clearRect(0, 0, this.width, this.height);

                for (c in this.composites) {
                    if (this.composites[c].drawConstraints) {
                        this.composites[c].drawConstraints(this.ctx, this.composites[c]);
                    } else {
                        var constraints = this.composites[c].constraints;
                        for (i in constraints) constraints[i].draw(this.ctx);
                    }

                    if (this.composites[c].drawParticles) {
                        this.composites[c].drawParticles(this.ctx, this.composites[c]);
                    } else {
                        var particles = this.composites[c].particles;
                        for (i in particles) particles[i].draw(this.ctx);
                    }
                }

                var nearest = this.draggedEntity || this.nearestEntity();

                if (nearest) {
                    this.ctx.beginPath();
                    this.ctx.arc(nearest.pos.x, nearest.pos.y, 8, 0, 2 * Math.PI);
                    this.ctx.strokeStyle = this.highlightColor;
                    this.ctx.stroke();
                }
            };

            VerletJS.prototype.nearestEntity = function () {
                var c, i;
                var d2Nearest = 0;
                var entity = null;
                var constraintsNearest = null;

                for (c in this.composites) {
                    var particles = this.composites[c].particles;
                    for (i in particles) {
                        var d2 = particles[i].pos.dist2(this.mouse);
                        if (
                            d2 <= this.selectionRadius * this.selectionRadius &&
                            (entity == null || d2 < d2Nearest)
                        ) {
                            entity = particles[i];
                            constraintsNearest = this.composites[c].constraints;
                            d2Nearest = d2;
                        }
                    }
                }

                for (i in constraintsNearest) {
                    if (
                        constraintsNearest[i] instanceof PinConstraint &&
                        constraintsNearest[i].a == entity
                    ) {
                        entity = constraintsNearest[i];
                    }
                }

                return entity;
            };
        },
        {
            "./vec2": 5
        }
    ]
}, {}, [1]);

function getViewport() {

    var viewPortWidth;
    var viewPortHeight;

    if (typeof window.innerWidth != 'undefined') {
        viewPortWidth = window.innerWidth,
            viewPortHeight = window.innerHeight
    }

    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth,
            viewPortHeight = document.documentElement.clientHeight
    }

    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
            viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }
    return [viewPortWidth, viewPortHeight];
}

VerletJS.prototype.spider = function (origin) {
    var i;
    var legSeg1Stiffness = 0.99;
    var legSeg2Stiffness = 0.99;
    var legSeg3Stiffness = 0.99;
    var legSeg4Stiffness = 0.99;

    var joint1Stiffness = 1;
    var joint2Stiffness = 0.4;
    var joint3Stiffness = 0.9;

    var bodyStiffness = 1;
    var bodyJointStiffness = 1;

    var composite = new this.Composite();
    composite.legs = [];


    composite.thorax = new Particle(origin);
    composite.head = new Particle(origin.add(new Vec2(0, -5)));
    composite.abdomen = new Particle(origin.add(new Vec2(0, 10)));

    composite.particles.push(composite.thorax);
    composite.particles.push(composite.head);
    composite.particles.push(composite.abdomen);

    composite.constraints.push(new DistanceConstraint(composite.head, composite.thorax, bodyStiffness));


    composite.constraints.push(new DistanceConstraint(composite.abdomen, composite.thorax, bodyStiffness));
    composite.constraints.push(new AngleConstraint(composite.abdomen, composite.thorax, composite.head, 0.4));


    // legs
    for (i = 0; i < 4; ++i) {
        composite.particles.push(new Particle(composite.particles[0].pos.add(new Vec2(3, (i - 1.5) * 3))));
        composite.particles.push(new Particle(composite.particles[0].pos.add(new Vec2(-3, (i - 1.5) * 3))));

        var len = composite.particles.length;

        composite.constraints.push(new DistanceConstraint(composite.particles[len - 2], composite.thorax, legSeg1Stiffness));
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 1], composite.thorax, legSeg1Stiffness));


        var lenCoef = 1;
        if (i == 1 || i == 2)
            lenCoef = 0.7;
        else if (i == 3)
            lenCoef = 0.9;

        composite.particles.push(new Particle(composite.particles[len - 2].pos.add((new Vec2(20, (i - 1.5) * 30)).normal().mutableScale(20 * lenCoef))));
        composite.particles.push(new Particle(composite.particles[len - 1].pos.add((new Vec2(-20, (i - 1.5) * 30)).normal().mutableScale(20 * lenCoef))));

        len = composite.particles.length;
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 4], composite.particles[len - 2], legSeg2Stiffness));
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 3], composite.particles[len - 1], legSeg2Stiffness));

        composite.particles.push(new Particle(composite.particles[len - 2].pos.add((new Vec2(20, (i - 1.5) * 50)).normal().mutableScale(20 * lenCoef))));
        composite.particles.push(new Particle(composite.particles[len - 1].pos.add((new Vec2(-20, (i - 1.5) * 50)).normal().mutableScale(20 * lenCoef))));

        len = composite.particles.length;
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 4], composite.particles[len - 2], legSeg3Stiffness));
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 3], composite.particles[len - 1], legSeg3Stiffness));


        var rightFoot = new Particle(composite.particles[len - 2].pos.add((new Vec2(20, (i - 1.5) * 100)).normal().mutableScale(12 * lenCoef)));
        var leftFoot = new Particle(composite.particles[len - 1].pos.add((new Vec2(-20, (i - 1.5) * 100)).normal().mutableScale(12 * lenCoef)))
        composite.particles.push(rightFoot);
        composite.particles.push(leftFoot);

        composite.legs.push(rightFoot);
        composite.legs.push(leftFoot);

        len = composite.particles.length;
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 4], composite.particles[len - 2], legSeg4Stiffness));
        composite.constraints.push(new DistanceConstraint(composite.particles[len - 3], composite.particles[len - 1], legSeg4Stiffness));


        composite.constraints.push(new AngleConstraint(composite.particles[len - 6], composite.particles[len - 4], composite.particles[len - 2], joint3Stiffness));
        composite.constraints.push(new AngleConstraint(composite.particles[len - 6 + 1], composite.particles[len - 4 + 1], composite.particles[len - 2 + 1], joint3Stiffness));

        composite.constraints.push(new AngleConstraint(composite.particles[len - 8], composite.particles[len - 6], composite.particles[len - 4], joint2Stiffness));
        composite.constraints.push(new AngleConstraint(composite.particles[len - 8 + 1], composite.particles[len - 6 + 1], composite.particles[len - 4 + 1], joint2Stiffness));

        composite.constraints.push(new AngleConstraint(composite.particles[0], composite.particles[len - 8], composite.particles[len - 6], joint1Stiffness));
        composite.constraints.push(new AngleConstraint(composite.particles[0], composite.particles[len - 8 + 1], composite.particles[len - 6 + 1], joint1Stiffness));

        composite.constraints.push(new AngleConstraint(composite.particles[1], composite.particles[0], composite.particles[len - 8], bodyJointStiffness));
        composite.constraints.push(new AngleConstraint(composite.particles[1], composite.particles[0], composite.particles[len - 8 + 1], bodyJointStiffness));
    }

    this.composites.push(composite);
    return composite;
}

VerletJS.prototype.spiderweb = function (origin, radius, segments, depth) {
    var stiffness = 0.99;
    var ringStiffness = 0.99;
    var i, j;
    var composite = new this.Composite();
    composite.grid = [];

    var centerParticle = new Particle(new Vec2(origin.x, origin.y));
    composite.particles.push(centerParticle);
    composite.pin(0);

    segments = 16; // force decagon

    // build spoke + ring particles
    for (j = 0; j < depth; ++j) {
        composite.grid[j] = [];
        var r = radius * (j + 1) / depth;
        for (i = 0; i < segments; ++i) {
            var theta = (2 * Math.PI * i) / segments - Math.PI / 2;
            composite.particles.push(new Particle(new Vec2(
                origin.x + Math.cos(theta) * r,
                origin.y + Math.sin(theta) * r
            )));
            composite.grid[j][i] = composite.particles.length - 1;
        }
    }

    // pin outermost ring
    for (i = 0; i < segments; ++i) {
        composite.pin(composite.grid[depth - 1][i]);
    }

    // spoke constraints: center -> ring0, ring0 -> ring1, ...
    for (i = 0; i < segments; ++i) {
        composite.constraints.push(new DistanceConstraint(
            centerParticle,
            composite.particles[composite.grid[0][i]],
            stiffness
        ));
        for (j = 0; j < depth - 1; ++j) {
            composite.constraints.push(new DistanceConstraint(
                composite.particles[composite.grid[j][i]],
                composite.particles[composite.grid[j + 1][i]],
                stiffness
            ));
        }
    }

    // ring constraints: connect neighbors on same ring
    for (j = 0; j < depth; ++j) {
        for (i = 0; i < segments; ++i) {
            composite.constraints.push(new DistanceConstraint(
                composite.particles[composite.grid[j][i]],
                composite.particles[composite.grid[j][(i + 1) % segments]],
                ringStiffness
            ));
        }
    }

    this.composites.push(composite);
    return composite;
}


function shuffle(o) { //v1.0
    for (var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

VerletJS.prototype.crawl = function (leg) {

    var stepRadius = 100;
    var minStepRadius = 35;

    var spiderweb = this.composites[0];
    var spider = this.composites[1];

    var theta = spider.particles[0].pos.angle2(spider.particles[0].pos.add(new Vec2(1, 0)), spider.particles[1].pos);

    var boundry1 = (new Vec2(Math.cos(theta), Math.sin(theta)));
    var boundry2 = (new Vec2(Math.cos(theta + Math.PI / 2), Math.sin(theta + Math.PI / 2)));


    var flag1 = leg < 4 ? 1 : -1;
    var flag2 = leg % 2 == 0 ? 1 : 0;

    var paths = [];

    var i;
    for (i in spiderweb.particles) {
        if (
            spiderweb.particles[i].pos.sub(spider.particles[0].pos).dot(boundry1) * flag1 >= 0
            && spiderweb.particles[i].pos.sub(spider.particles[0].pos).dot(boundry2) * flag2 >= 0
        ) {
            var d2 = spiderweb.particles[i].pos.dist2(spider.particles[0].pos);

            if (!(d2 >= minStepRadius * minStepRadius && d2 <= stepRadius * stepRadius))
                continue;

            var leftFoot = false;
            var j;
            for (j in spider.constraints) {
                var k;
                for (k = 0; k < 8; ++k) {
                    if (
                        spider.constraints[j] instanceof DistanceConstraint
                        && spider.constraints[j].a == spider.legs[k]
                        && spider.constraints[j].b == spiderweb.particles[i]) {
                        leftFoot = true;
                    }
                }
            }

            if (!leftFoot)
                paths.push(spiderweb.particles[i]);
        }
    }

    for (i in spider.constraints) {
        if (spider.constraints[i] instanceof DistanceConstraint && spider.constraints[i].a == spider.legs[leg]) {
            spider.constraints.splice(i, 1);
            break;
        }
    }

    if (paths.length > 0) {
        shuffle(paths);
        spider.constraints.push(new DistanceConstraint(spider.legs[leg], paths[0], 1, 0));
    }
}

window.onload = function () {
    var canvas = document.getElementById("web");

    var dpr = window.devicePixelRatio || 1;

    function getSize() {
        return { w: window.innerWidth, h: window.innerHeight };
    }

    var size = getSize();
    canvas.width = size.w * dpr;
    canvas.height = size.h * dpr;
    canvas.style.width = size.w + "px";
    canvas.style.height = size.h + "px";
    canvas.getContext("2d").scale(dpr, dpr);

    // simulation
    var sim = new VerletJS(size.w, size.h, canvas);

    // entities
    // ↓ Change web position: first number = X (lower = more left), second = Y (center vertical)
    // ↓ Change web size: third number = radius (lower = smaller web)
    var webRadius = Math.min(size.w, size.h) * 0.33; // <- change size here
    var webX = Math.max(webRadius * 1.1, Math.min(size.w * 0.28, webRadius * 1.6));  // <- move left/right here
    var webY = size.h / 2;       // <- move up/down here

    var spiderweb = sim.spiderweb(new Vec2(webX, webY), webRadius, 10, 10);

    var spider = sim.spider(new Vec2(webX, -300));

    window.addEventListener("resize", function () {
        size = getSize();
        canvas.width = size.w * dpr;
        canvas.height = size.h * dpr;
        canvas.style.width = size.w + "px";
        canvas.style.height = size.h + "px";
        canvas.getContext("2d").scale(dpr, dpr);
        sim.width = size.w;
        sim.height = size.h;
    });


    var webColor = getComputedStyle(document.documentElement).getPropertyValue('--web-color').trim() || "#ffffff";

    spiderweb.drawConstraints = function (ctx, composite) {
        var i;
        var segments = 0, depth = 10;
        var spokeCount = segments * depth;         // spoke constraints
        var ringStart = segments + spokeCount;     // after pin constraints + spoke constraints

        ctx.strokeStyle = webColor;
        ctx.lineCap = "round";

        for (i = 0; i < composite.constraints.length; ++i) {
            var c = composite.constraints[i];
            if (!(c instanceof DistanceConstraint)) continue;
            var isSpokeOrRing = i >= segments; // skip pin constraints
            if (!isSpokeOrRing) continue;
            var isSpoke = i < segments + spokeCount;
        ctx.lineWidth = isSpoke ? 2.5 : 1.8; // ← change spoke/ring thickness here
            ctx.globalAlpha = isSpoke ? 0.9 : 0.6;
            ctx.beginPath();
            ctx.moveTo(c.a.pos.x, c.a.pos.y);
            ctx.lineTo(c.b.pos.x, c.b.pos.y);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    spiderweb.drawParticles = function (ctx, composite) {}


    spider.drawConstraints = function (ctx, composite) {
        var i;

        // draw legs first (behind body)
        for (i = 3; i < composite.constraints.length; ++i) {
            var constraint = composite.constraints[i];
            if (!(constraint instanceof DistanceConstraint)) continue;

            var ax = constraint.a.pos.x, ay = constraint.a.pos.y;
            var bx = constraint.b.pos.x, by = constraint.b.pos.y;

            var isThick = (i >= 2 && i <= 4)
                || (i >= (2*9)+1 && i <= (2*9)+2)
                || (i >= (2*17)+1 && i <= (2*17)+2)
                || (i >= (2*25)+1 && i <= (2*25)+2);
            var isMid = (i >= 4 && i <= 6)
                || (i >= (2*9)+3 && i <= (2*9)+4)
                || (i >= (2*17)+3 && i <= (2*17)+4)
                || (i >= (2*25)+3 && i <= (2*25)+4);
            var isThin = (i >= 6 && i <= 8)
                || (i >= (2*9)+5 && i <= (2*9)+6)
                || (i >= (2*17)+5 && i <= (2*17)+6)
                || (i >= (2*25)+5 && i <= (2*25)+6);

            var lw = isThick ? 3.5 : isMid ? 2.5 : isThin ? 1.8 : 1.2;

            // tapered leg with gradient
            var grad = ctx.createLinearGradient(ax, ay, bx, by);
            grad.addColorStop(0, "#1a1a1a");
            grad.addColorStop(0.5, "#3a3a3a");
            grad.addColorStop(1, "#111111");

            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = grad;
            ctx.lineWidth = lw;
            ctx.lineCap = "round";
            ctx.stroke();

            // hair spines on legs
            if (isMid || isThin) {
                var dx = bx - ax, dy = by - ay;
                var len = Math.sqrt(dx*dx + dy*dy);
                if (len > 0) {
                    var nx = -dy/len, ny = dx/len;
                    var steps = Math.floor(len / 6);
                    ctx.strokeStyle = "#222222";
                    ctx.lineWidth = 0.5;
                    for (var s = 1; s < steps; s++) {
                        var t = s / steps;
                        var hx = ax + dx*t, hy = ay + dy*t;
                        var hlen = (s % 2 === 0 ? 3 : 2);
                        var side = (s % 2 === 0 ? 1 : -1);
                        ctx.beginPath();
                        ctx.moveTo(hx, hy);
                        ctx.lineTo(hx + nx*hlen*side, hy + ny*hlen*side);
                        ctx.stroke();
                    }
                }
            }
        }

        // abdomen - large oval with gradient
        var abdX = spider.abdomen.pos.x, abdY = spider.abdomen.pos.y;
        var abdGrad = ctx.createRadialGradient(abdX - 2, abdY - 3, 1, abdX, abdY, 11);
        abdGrad.addColorStop(0, "#4a4a4a");
        abdGrad.addColorStop(0.4, "#1a1a1a");
        abdGrad.addColorStop(1, "#000000");
        ctx.beginPath();
        ctx.ellipse(abdX, abdY, 11, 14, 0, 0, Math.PI * 2);
        ctx.fillStyle = abdGrad;
        ctx.fill();

        // abdomen markings
        ctx.fillStyle = "rgba(180,120,0,0.35)";
        for (var m = 0; m < 3; m++) {
            ctx.beginPath();
            ctx.ellipse(abdX, abdY - 4 + m * 4, 4, 2, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // thorax with gradient
        var thX = spider.thorax.pos.x, thY = spider.thorax.pos.y;
        var thGrad = ctx.createRadialGradient(thX - 1, thY - 2, 1, thX, thY, 7);
        thGrad.addColorStop(0, "#555555");
        thGrad.addColorStop(1, "#111111");
        ctx.beginPath();
        ctx.ellipse(thX, thY, 6, 7, 0, 0, Math.PI * 2);
        ctx.fillStyle = thGrad;
        ctx.fill();

        // head with gradient
        var hX = spider.head.pos.x, hY = spider.head.pos.y;
        var hGrad = ctx.createRadialGradient(hX - 1, hY - 1, 0.5, hX, hY, 6);
        hGrad.addColorStop(0, "#4a4a4a");
        hGrad.addColorStop(1, "#111111");
        ctx.beginPath();
        ctx.arc(hX, hY, 5.5, 0, Math.PI * 2);
        ctx.fillStyle = hGrad;
        ctx.fill();

        // eyes - 4 pairs like a real spider
        var eyeOffsets = [[-2.5, -1.5], [2.5, -1.5], [-1.2, 0.5], [1.2, 0.5]];
        for (var e = 0; e < eyeOffsets.length; e++) {
            ctx.beginPath();
            ctx.arc(hX + eyeOffsets[e][0], hY + eyeOffsets[e][1], e < 2 ? 1.2 : 0.8, 0, Math.PI * 2);
            ctx.fillStyle = "#ffffff";
            ctx.fill();
            ctx.beginPath();
            ctx.arc(hX + eyeOffsets[e][0], hY + eyeOffsets[e][1], e < 2 ? 0.6 : 0.4, 0, Math.PI * 2);
            ctx.fillStyle = "#000000";
            ctx.fill();
        }

        // fangs
        ctx.strokeStyle = "#222222";
        ctx.lineWidth = 1.2;
        ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(hX - 1.5, hY + 4); ctx.lineTo(hX - 2.5, hY + 7); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(hX + 1.5, hY + 4); ctx.lineTo(hX + 2.5, hY + 7); ctx.stroke();
    }

    spider.drawParticles = function (ctx, composite) {
    }

    // animation loop
    var legIndex = 0;
    var loop = function () {
        if (Math.floor(Math.random() * 4) == 0) {
            sim.crawl(((legIndex++) * 3) % 8);
        }

        sim.frame(16);
        sim.draw();
        requestAnimFrame(loop);
    };

    loop();
};