"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateMesaDto = void 0;
var class_validator_1 = require("class-validator");
var mesa_entity_1 = require("../entities/mesa.entity");
var CreateMesaDto = function () {
    var _a;
    var _numero_decorators;
    var _numero_initializers = [];
    var _numero_extraInitializers = [];
    var _capacidad_decorators;
    var _capacidad_initializers = [];
    var _capacidad_extraInitializers = [];
    var _estado_decorators;
    var _estado_initializers = [];
    var _estado_extraInitializers = [];
    return _a = /** @class */ (function () {
            function CreateMesaDto() {
                this.numero = __runInitializers(this, _numero_initializers, void 0);
                this.capacidad = (__runInitializers(this, _numero_extraInitializers), __runInitializers(this, _capacidad_initializers, void 0));
                this.estado = (__runInitializers(this, _capacidad_extraInitializers), __runInitializers(this, _estado_initializers, void 0));
                __runInitializers(this, _estado_extraInitializers);
            }
            return CreateMesaDto;
        }()),
        (function () {
            var _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _numero_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Min)(1)];
            _capacidad_decorators = [(0, class_validator_1.IsNumber)(), (0, class_validator_1.IsPositive)(), (0, class_validator_1.Min)(1)];
            _estado_decorators = [(0, class_validator_1.IsEnum)(mesa_entity_1.MesaEstado), (0, class_validator_1.IsOptional)()];
            __esDecorate(null, null, _numero_decorators, { kind: "field", name: "numero", static: false, private: false, access: { has: function (obj) { return "numero" in obj; }, get: function (obj) { return obj.numero; }, set: function (obj, value) { obj.numero = value; } }, metadata: _metadata }, _numero_initializers, _numero_extraInitializers);
            __esDecorate(null, null, _capacidad_decorators, { kind: "field", name: "capacidad", static: false, private: false, access: { has: function (obj) { return "capacidad" in obj; }, get: function (obj) { return obj.capacidad; }, set: function (obj, value) { obj.capacidad = value; } }, metadata: _metadata }, _capacidad_initializers, _capacidad_extraInitializers);
            __esDecorate(null, null, _estado_decorators, { kind: "field", name: "estado", static: false, private: false, access: { has: function (obj) { return "estado" in obj; }, get: function (obj) { return obj.estado; }, set: function (obj, value) { obj.estado = value; } }, metadata: _metadata }, _estado_initializers, _estado_extraInitializers);
            if (_metadata) Object.defineProperty(_a, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        })(),
        _a;
}();
exports.CreateMesaDto = CreateMesaDto;
