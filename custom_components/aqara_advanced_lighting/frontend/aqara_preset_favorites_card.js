!function(){"use strict";function e(e,t,i,s){var r,o=arguments.length,n=o<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(r=e[a])&&(n=(o<3?r(n):o>3?r(t,i,n):r(t,i))||n);return o>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),r=new WeakMap;let o=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=r.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&r.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new o(i,e,s)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new o("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:c,defineProperty:d,getOwnPropertyDescriptor:l,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,_=globalThis,g=_.trustedTypes,f=g?g.emptyScript:"",v=_.reactiveElementPolyfillSupport,m=(e,t)=>e,y={toAttribute(e,t){switch(t){case Boolean:e=e?f:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},b=(e,t)=>!c(e,t),$={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&d(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:r}=l(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const o=s?.call(this);r?.call(this,t),this.requestUpdate(e,o,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$}static _$Ei(){if(this.hasOwnProperty(m("elementProperties")))return;const e=u(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(m("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(m("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),r=t.litNonce;void 0!==r&&s.setAttribute("nonce",r),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const r=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(t,i.type);this._$Em=e,null==r?this.removeAttribute(s):this.setAttribute(s,r),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),r="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:y;this._$Em=s;const o=r.fromAttribute(t,e.type);this[s]=o??this._$Ej?.get(s)??o,this._$Em=null}}requestUpdate(e,t,i,s=!1,r){if(void 0!==e){const o=this.constructor;if(!1===s&&(r=this[e]),i??=o.getPropertyOptions(e),!((i.hasChanged??b)(r,t)||i.useDefault&&i.reflect&&r===this._$Ej?.get(e)&&!this.hasAttribute(o._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,o??t??this[e]),!0!==r||void 0!==o)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[m("elementProperties")]=new Map,x[m("finalized")]=new Map,v?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,A=e=>e,E=w.trustedTypes,S=E?E.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,O="?"+M,k=`<${O}>`,P=document,T=()=>P.createComment(""),D=e=>null===e||"object"!=typeof e&&"function"!=typeof e,q=Array.isArray,z="[ \t\n\f\r]",U=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,R=/-->/g,I=/>/g,j=RegExp(`>|${z}(?:([^\\s"'>=/]+)(${z}*=${z}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),L=/'/g,H=/"/g,N=/^(?:script|style|textarea|title)$/i,B=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),F=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),V=new WeakMap,W=P.createTreeWalker(P,129);function Z(e,t){if(!q(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==S?S.createHTML(t):t}class Y{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let r=0,o=0;const n=e.length-1,a=this.parts,[c,d]=((e,t)=>{const i=e.length-1,s=[];let r,o=2===t?"<svg>":3===t?"<math>":"",n=U;for(let t=0;t<i;t++){const i=e[t];let a,c,d=-1,l=0;for(;l<i.length&&(n.lastIndex=l,c=n.exec(i),null!==c);)l=n.lastIndex,n===U?"!--"===c[1]?n=R:void 0!==c[1]?n=I:void 0!==c[2]?(N.test(c[2])&&(r=RegExp("</"+c[2],"g")),n=j):void 0!==c[3]&&(n=j):n===j?">"===c[0]?(n=r??U,d=-1):void 0===c[1]?d=-2:(d=n.lastIndex-c[2].length,a=c[1],n=void 0===c[3]?j:'"'===c[3]?H:L):n===H||n===L?n=j:n===R||n===I?n=U:(n=j,r=void 0);const h=n===j&&e[t+1].startsWith("/>")?" ":"";o+=n===U?i+k:d>=0?(s.push(a),i.slice(0,d)+C+i.slice(d)+M+h):i+M+(-2===d?t:h)}return[Z(e,o+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]})(e,t);if(this.el=Y.createElement(c,i),W.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=W.nextNode())&&a.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(C)){const t=d[o++],i=s.getAttribute(e).split(M),n=/([.?@])?(.*)/.exec(t);a.push({type:1,index:r,name:n[2],strings:i,ctor:"."===n[1]?ee:"?"===n[1]?te:"@"===n[1]?ie:X}),s.removeAttribute(e)}else e.startsWith(M)&&(a.push({type:6,index:r}),s.removeAttribute(e));if(N.test(s.tagName)){const e=s.textContent.split(M),t=e.length-1;if(t>0){s.textContent=E?E.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],T()),W.nextNode(),a.push({type:2,index:++r});s.append(e[t],T())}}}else if(8===s.nodeType)if(s.data===O)a.push({type:2,index:r});else{let e=-1;for(;-1!==(e=s.data.indexOf(M,e+1));)a.push({type:7,index:r}),e+=M.length-1}r++}}static createElement(e,t){const i=P.createElement("template");return i.innerHTML=e,i}}function J(e,t,i=e,s){if(t===F)return t;let r=void 0!==s?i._$Co?.[s]:i._$Cl;const o=D(t)?void 0:t._$litDirective$;return r?.constructor!==o&&(r?._$AO?.(!1),void 0===o?r=void 0:(r=new o(e),r._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=r:i._$Cl=r),void 0!==r&&(t=J(e,r._$AS(e,t.values),r,s)),t}let K=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??P).importNode(t,!0);W.currentNode=s;let r=W.nextNode(),o=0,n=0,a=i[0];for(;void 0!==a;){if(o===a.index){let t;2===a.type?t=new Q(r,r.nextSibling,this,e):1===a.type?t=new a.ctor(r,a.name,a.strings,this,e):6===a.type&&(t=new se(r,this,e)),this._$AV.push(t),a=i[++n]}o!==a?.index&&(r=W.nextNode(),o++)}return W.currentNode=P,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}};class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=J(this,e,t),D(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==F&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>q(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&D(this._$AH)?this._$AA.nextSibling.data=e:this.T(P.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new K(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=V.get(e.strings);return void 0===t&&V.set(e.strings,t=new Y(e)),t}k(e){q(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const r of e)s===t.length?t.push(i=new Q(this.O(T()),this.O(T()),this,this.options)):i=t[s],i._$AI(r),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=A(e).nextSibling;A(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class X{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,r){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=r,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,s){const r=this.strings;let o=!1;if(void 0===r)e=J(this,e,t,0),o=!D(e)||e!==this._$AH&&e!==F,o&&(this._$AH=e);else{const s=e;let n,a;for(e=r[0],n=0;n<r.length-1;n++)a=J(this,s[i+n],t,n),a===F&&(a=this._$AH[n]),o||=!D(a)||a!==this._$AH[n],a===G?e=G:e!==G&&(e+=(a??"")+r[n+1]),this._$AH[n]=a}o&&!s&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class ee extends X{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class te extends X{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class ie extends X{constructor(e,t,i,s,r){super(e,t,i,s,r),this.type=5}_$AI(e,t=this){if((e=J(this,e,t,0)??G)===F)return;const i=this._$AH,s=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class se{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){J(this,e)}}const re={I:Q},oe=w.litHtmlPolyfillSupport;oe?.(Y,Q),(w.litHtmlVersions??=[]).push("3.3.2");const ne=globalThis;let ae=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let r=s._$litPart$;if(void 0===r){const e=i?.renderBefore??null;s._$litPart$=r=new Q(t.insertBefore(T(),e),e,void 0,i??{})}return r._$AI(e),r})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return F}};ae._$litElement$=!0,ae.finalized=!0,ne.litElementHydrateSupport?.({LitElement:ae});const ce=ne.litElementPolyfillSupport;ce?.({LitElement:ae}),(ne.litElementVersions??=[]).push("4.2.2");const de=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},le={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},he=(e=le,t,i)=>{const{kind:s,metadata:r}=i;let o=globalThis.litPropertyMetadata.get(r);if(void 0===o&&globalThis.litPropertyMetadata.set(r,o=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),o.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const r=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,r,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const r=this[s];t.call(this,i),this.requestUpdate(s,r,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function ue(e){return pe({...e,state:!0,attribute:!1})}const _e={card:{name:"Aqara Advanced Lighting Presets",description:"Displays and activates your favorited Aqara Advanced Lighting presets for a specific entity.",default_title:"Favorite Presets",error_loading:"Failed to load preset data",empty_no_favorites:"No compatible favorites for this device",brightness_label:"Brightness",editor:{entities_label:"Entities",title_label:"Title",columns_label:"Grid columns",compact_label:"Compact mode",show_names_label:"Show preset names",highlight_user_label:"Highlight user presets",layout_label:"Layout",layout_grid:"Grid",layout_compact_grid:"Compact grid",layout_list:"List",layout_hero:"Hero",layout_carousel:"Carousel",brightness_override_label:"Brightness slider",brightness_override_position_label:"Slider position",brightness_override_position_header:"Header",brightness_override_position_footer:"Footer",preset_ids_label:"Presets shown",preset_ids_help:"Leave all checked and unmoved to use the global favorites order.",reset_to_global_button:"Reset to global order"}}};function ge(e,t,i){if(0===t.length)return"cct_sequence"===e.type||"dynamic_scene"===e.type;const s=function(e){const t=e.length>0,i=e.includes("t2_bulb"),s=e.includes("t2_cct"),r=e.includes("t1m"),o=e.includes("t1m_white"),n=e.includes("t1_strip"),a=e.includes("generic_rgb"),c=e.includes("generic_cct");return{showDynamicEffects:t&&(i||r||n),showSegmentPatterns:t&&(r||n),showSegmentSequences:t&&(r||n),showCCTSequences:t&&(i||s||o||n||a||c),showDynamicScenes:t&&(i||s||r||o||n||a||c),showMusicSync:t&&n,hasT2:i,hasT1M:r,hasT1Strip:n,t2Presets:[],t1mPresets:[],t1StripPresets:[]}}(t),r=e=>{if(!e)return!0;switch(e){case"t2_bulb":return s.hasT2;case"t1m":case"t1":return s.hasT1M;case"t1_strip":return s.hasT1Strip;default:return!0}};switch(e.type){case"effect":return s.showDynamicEffects&&r(i);case"segment_pattern":return s.showSegmentPatterns&&r(i);case"cct_sequence":return s.showCCTSequences;case"segment_sequence":return s.showSegmentSequences&&r(i);case"dynamic_scene":return s.showDynamicScenes;default:return!1}}function fe(e,t,i,s,r={}){const o=[];for(const n of e){let e,a=null,c=!1;switch(n.type){case"effect":for(const i of["t2_bulb","t1m","t1_strip"]){const s=t.dynamic_effects?.[i]?.find(e=>e.id===n.id);if(s){a=s,e=i;break}}if(!a){const t=i.effect_presets?.find(e=>e.id===n.id);t&&(a=t,c=!0,e=t.device_type)}break;case"segment_pattern":if(a=t.segment_patterns?.find(e=>e.id===n.id)||null,!a){const t=i.segment_pattern_presets?.find(e=>e.id===n.id);t&&(a=t,c=!0,e=t.device_type)}break;case"cct_sequence":a=t.cct_sequences?.find(e=>e.id===n.id)||null,a||(a=i.cct_sequence_presets?.find(e=>e.id===n.id)||null,a&&(c=!0));break;case"segment_sequence":if(a=t.segment_sequences?.find(e=>e.id===n.id)||null,!a){const t=i.segment_sequence_presets?.find(e=>e.id===n.id);t&&(a=t,c=!0,e=t.device_type)}break;case"dynamic_scene":a=t.dynamic_scenes?.find(e=>e.id===n.id)||null,a||(a=i.dynamic_scene_presets?.find(e=>e.id===n.id)||null,a&&(c=!0))}a&&(r.skipCompatibility||ge(n,s,e))&&o.push({ref:n,preset:a,isUser:c,deviceType:e})}return o}const ve=2,me=e=>(...t)=>({_$litDirective$:e,values:t});let ye=class{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}};class be extends ye{constructor(e){if(super(e),this.it=G,e.type!==ve)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===G||null==e)return this._t=void 0,this.it=e;if(e===F)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}be.directiveName="unsafeHTML",be.resultType=1;const $e=me(be);function xe(e,t,i=255){if(0===t)return{r:0,g:0,b:0};const s=1/t*e,r=1/t*(1-e-t);let o=3.2406*s-1.5372+-.4986*r,n=-.9689*s+1.8758+.0415*r,a=.0557*s-.204+1.057*r;const c=Math.max(o,n,a);c>1&&(o/=c,n/=c,a/=c),o=Math.max(0,o),n=Math.max(0,n),a=Math.max(0,a),o=o<=.0031308?12.92*o:1.055*Math.pow(o,1/2.4)-.055,n=n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055,a=a<=.0031308?12.92*a:1.055*Math.pow(a,1/2.4)-.055;const d=i/255;return{r:Math.max(0,Math.min(255,Math.round(255*o*d))),g:Math.max(0,Math.min(255,Math.round(255*n*d))),b:Math.max(0,Math.min(255,Math.round(255*a*d)))}}function we(e){const t=e=>e.toString(16).padStart(2,"0");return`#${t(e.r)}${t(e.g)}${t(e.b)}`}function Ae(e,t=255){return we(xe(e.x,e.y,t))}const Ee=200,Se=200,Ce=180;function Me(e,t){const i=(e-90)*Math.PI/180;return[Math.round(100*(Ee+t*Math.cos(i)))/100,Math.round(100*(Se+t*Math.sin(i)))/100]}function Oe(e,t,i){if(t-e>=360)return`<circle cx="200" cy="200" r="180" fill="${i}" />`;const[s,r]=Me(e,Ce),[o,n]=Me(t,Ce);return`<path fill="${i}" stroke="${i}" stroke-width="1" d="M200,200 L${s},${r} A180,180 0 ${t-e>180?1:0},1 ${o},${n} Z" />`}function ke(e){const t=Math.round(e.brightness_pct/100*255);return we(xe(e.x,e.y,t))}const Pe=new Map;function Te(e){if(e.length<=8)return e;const t=[];for(let i=0;i<8;i++){const s=Math.round(i/8*e.length)%e.length;t.push({hex:e[s].hex,startDeg:45*i,endDeg:45*(i+1)})}return t}function De(e){return we(function(e){const t=e/100;let i,s,r;return t<=66?i=255:(i=329.698727446*Math.pow(t-60,-.1332047592),i=Math.max(0,Math.min(255,i))),s=t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*Math.pow(t-60,-.0755148492),s=Math.max(0,Math.min(255,s)),t>=66?r=255:t<=19?r=0:(r=138.5177312231*Math.log(t-10)-305.0447927307,r=Math.max(0,Math.min(255,r))),{r:Math.round(i),g:Math.round(s),b:Math.round(r)}}(e))}function qe(e){return`<svg viewBox="20 20 360 360" xmlns="http://www.w3.org/2000/svg">${e}</svg>`}function ze(e){const t=e?.thumbnail;return t?B`<img
    src="/api/aqara_advanced_lighting/thumbnails/${t}"
    alt="Preset thumbnail"
    style="object-fit:cover"
  />`:null}function Ue(e){const t=ze(e);if(t)return t;if(!e.segments||0===e.segments.length)return null;const i=function(e){if(0===e.length)return[];const t="seg:"+e.map(e=>`${e.segment}:${e.color.r},${e.color.g},${e.color.b}`).join("|"),i=Pe.get(t);if(i)return i;const s=[...e].sort((e,t)=>("number"==typeof e.segment?e.segment:parseInt(e.segment,10))-("number"==typeof t.segment?t.segment:parseInt(t.segment,10))),r=360/s.length,o=[];let n=we(s[0].color),a=0;for(let e=1;e<s.length;e++){const t=we(s[e].color);t!==n&&(o.push({hex:n,startDeg:a,endDeg:e*r}),n=t,a=e*r)}o.push({hex:n,startDeg:a,endDeg:360});const c=Te(o);if(Pe.size>=64){const e=Pe.keys().next().value;void 0!==e&&Pe.delete(e)}return Pe.set(t,c),c}(e.segments),s=i.map(e=>Oe(e.startDeg,e.endDeg,e.hex)).join("");return B`${$e(qe(s))}`}function Re(e){const t=ze(e);if(t)return t;if(!e.steps||0===e.steps.length)return null;const i=e.steps[0];let s=[];if(i.segment_colors&&i.segment_colors.length>0?s=i.segment_colors.map(e=>we(e.color)):i.colors&&i.colors.length>0&&(s=i.colors.map(e=>we({r:e[0]??0,g:e[1]??0,b:e[2]??0}))),0===s.length)return null;const r=function(e){if(0===e.length)return[];const t="hex:"+e.join("|"),i=Pe.get(t);if(i)return i;const s=360/e.length,r=[];let o=e[0],n=0;for(let t=1;t<e.length;t++)e[t]!==o&&(r.push({hex:o,startDeg:n,endDeg:t*s}),o=e[t],n=t*s);r.push({hex:o,startDeg:n,endDeg:360});const a=Te(r);if(Pe.size>=64){const e=Pe.keys().next().value;void 0!==e&&Pe.delete(e)}return Pe.set(t,a),a}(s);if(1===r.length)return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${r[0].hex}" />`))}`;const o=r.map(e=>Oe(e.startDeg,e.endDeg,e.hex)).join("");return B`${$e(qe(o))}`}function Ie(e){const t=e.match(/^(\d{1,2}):(\d{2})$/);if(t)return 60*parseInt(t[1],10)+parseInt(t[2],10);const i=e.match(/^(sunrise|sunset)([+-]\d+)?$/);if(i){return("sunrise"===i[1]?360:1080)+(i[2]?parseInt(i[2],10):0)}return 0}function je(e){if("solar"===e.mode)return function(e){const t=e.solar_steps??[];if(0===t.length)return null;const i=function(e){const t=e.filter(e=>"rising"===e.phase).sort((e,t)=>e.sun_elevation-t.sun_elevation),i=e.filter(e=>"any"===e.phase).sort((e,t)=>e.sun_elevation-t.sun_elevation),s=e.filter(e=>"setting"===e.phase).sort((e,t)=>t.sun_elevation-e.sun_elevation);return[...t,...i,...s]}(t),s=i.map(e=>e.color_temp),r='<line x1="20" y1="200" x2="380" y2="200" stroke="var(--secondary-text-color, #888)" stroke-width="2" stroke-opacity="0.3" />';if(1===s.length){const e=De(s[0]);return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${e}" />${r}`))}`}const o=`solar-${e.id}`,n=`solar-clip-${e.id}`,a=s.map((e,t)=>`<stop offset="${Math.round(t/(s.length-1)*100)}%" stop-color="${De(e)}" />`).join("");return B`${$e(qe(`<defs><clipPath id="${n}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${o}" x1="0" y1="0" x2="1" y2="0">${a}</linearGradient></defs><rect fill="url(#${o})" x="0" y="0" width="400" height="400" clip-path="url(#${n})" />`+r))}`}(e);if("schedule"===e.mode)return function(e){const t=e.schedule_steps??[];if(0===t.length)return null;const i=[...t].sort((e,t)=>Ie(e.time)-Ie(t.time)),s=i.map(e=>e.color_temp);if(1===s.length){const e=De(s[0]);return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const r=i.map(e=>Ie(e.time)),o=r[0],n=r[r.length-1]-o,a=`sched-${e.id}`,c=`sched-clip-${e.id}`,d=s.map((e,t)=>`<stop offset="${n>0?Math.round((r[t]-o)/n*100):Math.round(t/(s.length-1)*100)}%" stop-color="${De(e)}" />`).join("");return B`${$e(qe(`<defs><clipPath id="${c}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${a}" x1="0" y1="0" x2="0" y2="1">${d}</linearGradient></defs><rect fill="url(#${a})" x="0" y="0" width="400" height="400" clip-path="url(#${c})" />`))}`}(e);const t=(e.steps??[]).map(e=>e.color_temp).filter(e=>null!=e);if(0===t.length)return null;if(1===t.length){const e=De(t[0]);return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const i=`cct-${e.id}`,s=`cct-clip-${e.id}`,r=t.map((e,i)=>`<stop offset="${Math.round(i/(t.length-1)*100)}%" stop-color="${De(e)}" />`).join("");return B`${$e(qe(`<defs><clipPath id="${s}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${i}" x1="0" y1="0" x2="1" y2="0">${r}</linearGradient></defs><rect fill="url(#${i})" x="0" y="0" width="400" height="400" clip-path="url(#${s})" />`))}`}function Le(e){const t=xe(e.x,e.y,255),i=function(e,t,i){const s=e/255,r=t/255,o=i/255,n=Math.max(s,r,o),a=n-Math.min(s,r,o);let c=0,d=0;return 0!==n&&(d=a/n*100),0!==a&&(c=n===s?(r-o)/a%6:n===r?(o-s)/a+2:(s-r)/a+4,c=Math.round(60*c),c<0&&(c+=360)),{h:c,s:Math.round(d)}}(t.r,t.g,t.b);return 0===i.s?360:i.h}function He(e){if(!Array.isArray(e)){const t=ze(e);if(t)return t}let t,i;if(Array.isArray(e)?(t=e.slice(0,8),i=`ds-${t.map(e=>`${e.x}${e.y}`).join("")}`):(t=(e.colors??[]).slice(0,8),i=`ds-${e.id}`),0===t.length)return null;if(1===t.length){const e=ke(t[0]);return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const s=[...t].sort((e,t)=>Le(e)-Le(t)),r=`${i}-clip`,o=s.map((e,t)=>`<stop offset="${Math.round(t/(s.length-1)*100)}%" stop-color="${ke(e)}" />`).join("");return B`${$e(qe(`<defs><clipPath id="${r}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${i}" x1="0" y1="0" x2="1" y2="1">${o}</linearGradient></defs><rect fill="url(#${i})" x="0" y="0" width="400" height="400" clip-path="url(#${r})" />`))}`}function Ne(e,t){return e?e.includes(".")?B`<img src="/api/aqara_advanced_lighting/icons/${e}" alt="preset icon" />`:B`<ha-icon icon="${e}"></ha-icon>`:B`<ha-icon icon="${t}"></ha-icon>`}const Be=B`<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`,Fe=(e,t)=>t?B`${e}${Be}`:e;function Ge(e,t){const i=t&&!!e.audio_config?.audio_speed_mode;if(e.icon&&!e.thumbnail)return Fe(Ne(e.icon,"mdi:lightbulb-on"),i);const s=function(e){const t=ze(e);if(t)return t;const i=(e.effect_colors??[]).slice(0,8);if(0===i.length)return null;if(1===i.length){const e=Ae(i[0]);return B`${$e(qe(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const s=360/i.length,r=i.map((e,t)=>Oe(t*s,(t+1)*s,Ae(e))).join("");return B`${$e(qe(r))}`}(e)??B`<ha-icon icon="mdi:lightbulb-on"></ha-icon>`;return Fe(s,i)}function Ve(e,t,i,s={}){const r=!1!==s.showAudioBadge;switch(e.type){case"effect":return i?Ge(t,r):function(e,t){const i=Ne(e.icon,"mdi:lightbulb-on"),s=t&&!!e.audio_speed_mode;return Fe(i,s)}(t,r);case"segment_pattern":return i?function(e){return e.icon&&!e.thumbnail?Ne(e.icon,"mdi:palette"):Ue(e)??B`<ha-icon icon="mdi:palette"></ha-icon>`}(t):Ne(t.icon,"mdi:palette");case"cct_sequence":return i?function(e){return e.icon?Ne(e.icon,"mdi:temperature-kelvin"):je(e)??B`<ha-icon icon="mdi:temperature-kelvin"></ha-icon>`}(t):Ne(t.icon,"mdi:temperature-kelvin");case"segment_sequence":return i?function(e){return e.icon&&!e.thumbnail?Ne(e.icon,"mdi:animation-play"):Re(e)??B`<ha-icon icon="mdi:animation-play"></ha-icon>`}(t):Ne(t.icon,"mdi:animation-play");case"dynamic_scene":return i?function(e,t){const i=t&&!(!e.audio_entity&&!e.audio_color_advance);if(e.thumbnail){const t=He(e)??B`<ha-icon icon="mdi:lamps"></ha-icon>`;return Fe(t,i)}if(e.icon)return Fe(Ne(e.icon,"mdi:lamps"),i);const s=He(e)??B`<ha-icon icon="mdi:lamps"></ha-icon>`;return Fe(s,i)}(t,r):function(e,t){const i=He(e)??B`<ha-icon icon="mdi:lamps"></ha-icon>`,s=t&&!!e.audio_color_advance;return Fe(i,s)}(t,r);default:return B`<ha-icon icon="mdi:star"></ha-icon>`}}const We="aqara_advanced_lighting";async function Ze(e,t,i,s,r,o={}){if(0!==t.length)switch(i.type){case"effect":return r?async function(e,t,i,s){const r={entity_id:t,effect:i.effect,speed:i.effect_speed,preset:i.name,turn_on:!0,sync:!0};i.effect_colors.forEach((e,t)=>{t<8&&(r[`color_${t+1}`]={x:e.x,y:e.y})}),void 0!==i.effect_brightness?r.brightness=i.effect_brightness:void 0!==s.brightness&&(r.brightness=s.brightness);i.effect_segments&&(r.segments=i.effect_segments);if(s.useEffectAudioReactive){if(s.audioOverrideEntity){const e=i.audio_config;r.audio_entity=s.audioOverrideEntity,r.audio_sensitivity=e?.audio_sensitivity??s.effectAudioOverrideSensitivity,r.audio_silence_behavior=e?.audio_silence_behavior??"decay_min",r.audio_speed_mode=e?.audio_speed_mode||"volume",void 0!==e?.audio_speed_min&&(r.audio_speed_min=e.audio_speed_min),void 0!==e?.audio_speed_max&&(r.audio_speed_max=e.audio_speed_max)}}else if(i.audio_config?.audio_entity){const e=i.audio_config,t=e.audio_entity||s.audioOverrideEntity;t&&(r.audio_entity=t,r.audio_sensitivity=e.audio_sensitivity??50,r.audio_silence_behavior=e.audio_silence_behavior??"decay_min",e.audio_speed_mode&&(r.audio_speed_mode=e.audio_speed_mode,r.audio_speed_min=e.audio_speed_min??1,r.audio_speed_max=e.audio_speed_max??100))}await e.callService(We,"set_dynamic_effect",r)}(e,t,s,o):async function(e,t,i,s){const r={entity_id:t,preset:i.id,turn_on:!0,sync:!0};void 0!==s.brightness&&(r.brightness=s.brightness);if(s.useEffectAudioReactive)s.audioOverrideEntity&&(r.audio_entity=s.audioOverrideEntity,r.audio_sensitivity=i.audio_sensitivity??s.effectAudioOverrideSensitivity,r.audio_silence_behavior=i.audio_silence_behavior??"decay_min",r.audio_speed_mode=i.audio_speed_mode||"volume",void 0!==i.audio_speed_min&&(r.audio_speed_min=i.audio_speed_min),void 0!==i.audio_speed_max&&(r.audio_speed_max=i.audio_speed_max));else if(i.audio_speed_mode){const e=s.audioOverrideEntity;e&&(r.audio_entity=e)}await e.callService(We,"set_dynamic_effect",r)}(e,t,s,o);case"segment_pattern":return r?async function(e,t,i,s){if(!i.segments||!Array.isArray(i.segments)||0===i.segments.length)return;const r=i.segments.filter(e=>e&&e.color).map(e=>({segment:e.segment,color:{r:e.color.r,g:e.color.g,b:e.color.b}}));if(0===r.length)return;const o={entity_id:t,segment_colors:r,preset:i.name,turn_on:!0,sync:!0,turn_off_unspecified:!0};void 0!==s.brightness&&(o.brightness=s.brightness);try{await e.callService(We,"set_segment_pattern",o)}catch(e){}}(e,t,s,o):async function(e,t,i,s){const r={entity_id:t,preset:i.id,turn_on:!0,sync:!0};void 0!==s.brightness&&(r.brightness=s.brightness);await e.callService(We,"set_segment_pattern",r)}(e,t,s,o);case"cct_sequence":return r?async function(e,t,i){if("solar"===i.mode||"schedule"===i.mode)return void await e.callService(We,"start_cct_sequence",{entity_id:t,preset:i.name,sync:!0});const s={entity_id:t,preset:i.name,loop_mode:i.loop_mode,end_behavior:i.end_behavior,turn_on:!0,sync:!0};"count"===i.loop_mode&&void 0!==i.loop_count&&(s.loop_count=i.loop_count);i.steps.forEach((e,t)=>{const i=t+1;i<=20&&(s[`step_${i}_color_temp`]=e.color_temp,s[`step_${i}_brightness`]=e.brightness,s[`step_${i}_transition`]=e.transition,s[`step_${i}_hold`]=e.hold)}),await e.callService(We,"start_cct_sequence",s)}(e,t,s):async function(e,t,i){const s="solar"===i.mode||"schedule"===i.mode;await e.callService(We,"start_cct_sequence",{entity_id:t,preset:i.id,...!s&&{turn_on:!0},sync:!0})}(e,t,s);case"segment_sequence":return r?async function(e,t,i,s){const r={entity_id:t,preset:i.name,loop_mode:i.loop_mode,end_behavior:i.end_behavior,turn_on:!0,sync:!0};void 0!==s.brightness&&(r.brightness=s.brightness);"count"===i.loop_mode&&void 0!==i.loop_count&&(r.loop_count=i.loop_count);i.steps.forEach((e,t)=>{const i=t+1;i<=20&&(r[`step_${i}_segments`]=e.segments,r[`step_${i}_mode`]=e.mode,r[`step_${i}_duration`]=e.duration,r[`step_${i}_hold`]=e.hold,r[`step_${i}_activation_pattern`]=e.activation_pattern,e.colors&&Array.isArray(e.colors)&&e.colors.forEach((e,t)=>{t<6&&(r[`step_${i}_color_${t+1}`]=e)}))}),await e.callService(We,"start_segment_sequence",r)}(e,t,s,o):async function(e,t,i,s){const r={entity_id:t,preset:i.id,turn_on:!0,sync:!0};void 0!==s.brightness&&(r.brightness=s.brightness);await e.callService(We,"start_segment_sequence",r)}(e,t,s,o);case"dynamic_scene":return r?async function(e,t,i,s){const r=s.brightness??null,o={entity_id:t,scene_name:i.name,transition_time:i.transition_time,hold_time:i.hold_time,distribution_mode:s.useDistributionModeOverride?s.distributionModeOverride:i.distribution_mode,random_order:i.random_order,loop_mode:i.loop_mode,end_behavior:i.end_behavior};void 0!==i.offset_delay&&i.offset_delay>0&&(o.offset_delay=i.offset_delay);"count"===i.loop_mode&&void 0!==i.loop_count&&(o.loop_count=i.loop_count);o.colors=i.colors.map(e=>({x:e.x,y:e.y,brightness_pct:r??e.brightness_pct})),s.useStaticSceneMode&&(o.static=!0);Je(o,s),Ye(o,i,s),await e.callService(We,"start_dynamic_scene",o)}(e,t,s,o):async function(e,t,i,s){const r=s.brightness??null,o={entity_id:t,scene_name:i.name,transition_time:i.transition_time,hold_time:i.hold_time,distribution_mode:s.useDistributionModeOverride?s.distributionModeOverride:i.distribution_mode,random_order:i.random_order,loop_mode:i.loop_mode,end_behavior:i.end_behavior};void 0!==i.offset_delay&&i.offset_delay>0&&(o.offset_delay=i.offset_delay);"count"===i.loop_mode&&void 0!==i.loop_count&&(o.loop_count=i.loop_count);o.colors=i.colors.map(e=>({x:e.x,y:e.y,brightness_pct:r??e.brightness_pct})),s.useStaticSceneMode&&(o.static=!0);Je(o,s),Ye(o,i,s),await e.callService(We,"start_dynamic_scene",o)}(e,t,s,o)}}function Ye(e,t,i){if(i.useAudioReactive&&i.audioOverrideEntity)return;if(!t.audio_color_advance)return;const s=t.audio_entity||i.audioOverrideEntity;s&&(e.audio_entity=s,e.audio_color_advance=t.audio_color_advance,null!=t.audio_sensitivity&&(e.audio_sensitivity=t.audio_sensitivity),void 0!==t.audio_brightness_curve&&(e.audio_brightness_curve=t.audio_brightness_curve),null!=t.audio_brightness_min&&(e.audio_brightness_min=t.audio_brightness_min),null!=t.audio_brightness_max&&(e.audio_brightness_max=t.audio_brightness_max),null!=t.audio_transition_speed&&(e.audio_transition_speed=t.audio_transition_speed),null!=t.audio_detection_mode&&(e.audio_detection_mode=t.audio_detection_mode),null!=t.audio_frequency_zone&&(e.audio_frequency_zone=t.audio_frequency_zone),null!=t.audio_silence_behavior&&(e.audio_silence_behavior=t.audio_silence_behavior),null!=t.audio_prediction_aggressiveness&&(e.audio_prediction_aggressiveness=t.audio_prediction_aggressiveness),null!=t.audio_latency_compensation_ms&&(e.audio_latency_compensation_ms=t.audio_latency_compensation_ms),null!=t.audio_color_by_frequency&&(e.audio_color_by_frequency=t.audio_color_by_frequency),null!=t.audio_rolloff_brightness&&(e.audio_rolloff_brightness=t.audio_rolloff_brightness))}function Je(e,t){t.useAudioReactive&&t.audioOverrideEntity&&(e.audio_entity=t.audioOverrideEntity,void 0!==t.audioOverrideSensitivity&&(e.audio_sensitivity=t.audioOverrideSensitivity),void 0!==t.audioOverrideColorAdvance&&(e.audio_color_advance=t.audioOverrideColorAdvance),void 0!==t.audioOverrideTransitionSpeed&&(e.audio_transition_speed=t.audioOverrideTransitionSpeed),void 0!==t.audioOverrideBrightnessCurve&&(e.audio_brightness_curve=t.audioOverrideBrightnessCurve),void 0!==t.audioOverrideBrightnessMin&&(e.audio_brightness_min=t.audioOverrideBrightnessMin),void 0!==t.audioOverrideBrightnessMax&&(e.audio_brightness_max=t.audioOverrideBrightnessMax),void 0!==t.audioOverrideDetectionMode&&(e.audio_detection_mode=t.audioOverrideDetectionMode),void 0!==t.audioOverrideFrequencyZone&&(e.audio_frequency_zone=t.audioOverrideFrequencyZone),void 0!==t.audioOverrideSilenceBehavior&&(e.audio_silence_behavior=t.audioOverrideSilenceBehavior),void 0!==t.audioOverridePredictionAggressiveness&&(e.audio_prediction_aggressiveness=t.audioOverridePredictionAggressiveness),void 0!==t.audioOverrideLatencyCompensationMs&&(e.audio_latency_compensation_ms=t.audioOverrideLatencyCompensationMs),void 0!==t.audioOverrideColorByFrequency&&(e.audio_color_by_frequency=t.audioOverrideColorByFrequency),void 0!==t.audioOverrideRolloffBrightness&&(e.audio_rolloff_brightness=t.audioOverrideRolloffBrightness))}const Ke=36e5,Qe=12e4,Xe=new Map,et=new Map;function tt(e,t){Xe.set(e,{data:t,timestamp:Date.now()})}function it(e){Xe.delete(e),et.delete(e)}async function st(e,t,i){const s=function(e,t){const i=Xe.get(e);if(i&&Date.now()-i.timestamp<t)return i.data}(e,t);if(void 0!==s)return s;const r=et.get(e);if(r)return r;const o=i().then(t=>(tt(e,t),t)).finally(()=>et.delete(e));return et.set(e,o),o}async function rt(e,t={}){return t.bypassCache&&it("presets"),st("presets",Ke,async()=>{const t=await e.fetchWithAuth("/api/aqara_advanced_lighting/presets");if(!t.ok)throw new Error(`Presets fetch failed: ${t.status}`);return t.json()})}async function ot(e,t={}){return t.bypassCache&&it("user_presets"),st("user_presets",Qe,()=>e.callApi("GET","aqara_advanced_lighting/user_presets"))}async function nt(e,t={}){return t.bypassCache&&it("user_preferences"),st("user_preferences",Qe,()=>e.callApi("GET","aqara_advanced_lighting/user_preferences"))}async function at(e,t={}){return t.bypassCache&&it("supported_entities"),st("supported_entities",Ke,()=>e.callApi("GET","aqara_advanced_lighting/supported_entities"))}async function ct(e,t={}){if(t.bypassCache)it("running_operations");else{const e=Xe.get("running_operations");if(e)return e.data}const i=await e.callApi("GET","aqara_advanced_lighting/running_operations");return tt("running_operations",i),i}let dt=!1,lt=!1;function ht(e,t){const i=new Set(t),s=new Map;if(!e)return s;for(const t of e){if(!t.preset_id)continue;("string"==typeof t.entity_id&&i.has(t.entity_id)||Array.isArray(t.entity_ids)&&t.entity_ids.some(e=>i.has(e)))&&s.set(t.preset_id,t.type)}return s}async function pt(e,t,i){const s=await ct(e,{bypassCache:!0}).catch(()=>{});s&&i(ht(s.operations,t))}var ut;let _t=ut=class extends ae{constructor(){super(...arguments),this._t=_e.card,this._favoriteRefs=[],this._supportedEntities=new Map,this._loading=!0,this._activePresets=new Map,this._brightnessValue=100,this._dataLoaded=!1,this._subscriptionFailed=!1,this._lastHassConnected=!0,this._subscribing=!1,this._subscribedEntityIds=[]}_findActiveOpType(e,t){const i=this._activePresets.get(e.id);if(i===e.type)return i;const s=this._activePresets.get(t.name);return s===e.type?s:void 0}setConfig(e){if(!(e.entity||e.entities&&0!==e.entities.length))throw new Error("At least one entity is required");this._config=function(e){return!0===e.compact&&void 0===e.layout?{...e,layout:"compact-grid"}:e}(e)}_getEntityIds(){return this._config?.entities?.length?this._config.entities:this._config?.entity?[this._config.entity]:[]}getCardSize(){return 3}static getConfigElement(){return document.createElement("aqara-preset-favorites-card-editor")}static getStubConfig(){return{entity:"",title:_e.card.default_title}}async updated(e){if(super.updated(e),!this._subscribing){if(e.has("hass")&&this.hass){this._subscribing=!0;try{if(!this._dataLoaded)await this._loadData(),await this._startSubscription(),this._lastHassConnected=!1!==this.hass.connected;else{const e=!1!==this.hass.connected;!this._lastHassConnected&&e&&await this._resyncRunningOps(),this._lastHassConnected=e}}finally{this._subscribing=!1}}if(e.has("hass")&&!this.hass&&this._stopSubscription(),e.has("_config")&&this._dataLoaded&&this.hass&&!this._subscribing){const e=this._getEntityIds();if(!(e.length===this._subscribedEntityIds.length&&e.every(e=>this._subscribedEntityIds.includes(e)))){this._subscribing=!0;try{await this._startSubscription()}finally{this._subscribing=!1}}}}}disconnectedCallback(){super.disconnectedCallback(),this._stopSubscription()}async _startSubscription(){if(this._stopSubscription(),!this.hass)return;const e=this._getEntityIds();try{const t=await async function(e,t,i){let s;const r=async()=>{try{const s=await ct(e,{bypassCache:!0});i(ht(s.operations,t))}catch(e){lt||(lt=!0)}};await r();try{s=await e.connection.subscribeEvents(r,"aqara_advanced_lighting_operations_changed")}catch(e){throw dt||(dt=!0),e}return()=>{s&&(s(),s=void 0)}}(this.hass,e,e=>{this._activePresets=e});if(!this.isConnected)return void t();this._unsubRunningOps=t,this._subscriptionFailed=!1,this._subscribedEntityIds=[...e]}catch{this._subscriptionFailed=!0,this._subscribedEntityIds=[]}}async _resyncRunningOps(){if(this.hass)try{const e=await ct(this.hass,{bypassCache:!0});this._activePresets=ht(e.operations,this._getEntityIds())}catch{}}_stopSubscription(){this._unsubRunningOps&&(this._unsubRunningOps(),this._unsubRunningOps=void 0),this._subscribedEntityIds=[]}async _loadData(){if(this.hass){this._loading=!0,this._error=void 0;try{const[e,t,i,s]=await Promise.all([rt(this.hass),ot(this.hass),nt(this.hass),at(this.hass)]);this._presets=e,this._userPresets=t,this._favoriteRefs=i.favorite_presets||[];const r=new Map;for(const e of s.entities||[])r.set(e.entity_id,{device_type:e.device_type,model_id:e.model_id});this._supportedEntities=r,this._dataLoaded=!0}catch(e){this._error=this._t.error_loading}finally{this._loading=!1}}}_getSelectedDeviceTypes(){const e=this._getEntityIds(),t=[];for(const i of e){const e=this._supportedEntities.get(i)?.device_type;e&&!t.includes(e)&&t.push(e)}return t}async _activatePreset(e,t,i){const s=this._getEntityIds();if(0===s.length)return;const r=this._findActiveOpType(e,t);if(r){const i=this._activePresets.has(e.id)?e.id:t.name;return void await this._stopPreset(i,r)}this._activating=e.id;try{const r=await this._buildActivationOptions();await Ze(this.hass,s,e,t,i,r)}catch(e){}finally{this._activating=void 0,this._subscriptionFailed&&await pt(this.hass,this._getEntityIds(),e=>{this._activePresets=e})}}async _buildActivationOptions(){let e;try{e=await nt(this.hass)}catch{}const t=e?{audioOverrideEntity:e.audio_override_entity??void 0,useAudioReactive:e.use_audio_reactive,useEffectAudioReactive:e.use_effect_audio_reactive,effectAudioOverrideSensitivity:e.effect_audio_override_sensitivity,audioOverrideSensitivity:e.audio_override_sensitivity,audioOverrideColorAdvance:e.audio_override_color_advance??null,audioOverrideTransitionSpeed:e.audio_override_transition_speed,audioOverrideBrightnessCurve:e.audio_override_brightness_curve??null,audioOverrideBrightnessMin:e.audio_override_brightness_min,audioOverrideBrightnessMax:e.audio_override_brightness_max,audioOverrideDetectionMode:e.audio_override_detection_mode,audioOverrideFrequencyZone:e.audio_override_frequency_zone,audioOverrideSilenceBehavior:e.audio_override_silence_behavior,audioOverridePredictionAggressiveness:e.audio_override_prediction_aggressiveness,audioOverrideLatencyCompensationMs:e.audio_override_latency_compensation_ms,audioOverrideColorByFrequency:e.audio_override_color_by_frequency,audioOverrideRolloffBrightness:e.audio_override_rolloff_brightness}:{};return this._config?.brightness_override&&(t.brightness=this._brightnessValue),t}async _stopPreset(e,t){const i=this._getEntityIds();if(0===i.length)return;const s=ut._STOP_SERVICES[t];if(s){this._activating=e;try{const e={entity_id:i};"segment_sequence"!==t&&(e.restore_state=!0),await this.hass.callService("aqara_advanced_lighting",s,e)}catch(e){}finally{this._activating=void 0,this._activePresets.delete(e),this._subscriptionFailed&&await pt(this.hass,this._getEntityIds(),e=>{this._activePresets=e})}}}render(){if(!this._config)return B``;const e=void 0===this._config.title?this._t.default_title:this._config.title||void 0;if(this._loading)return B`
        <ha-card .header=${e}>
          <div class="card-content loading">
            <ha-circular-progress indeterminate></ha-circular-progress>
          </div>
        </ha-card>
      `;if(this._error)return B`
        <ha-card .header=${e}>
          <div class="card-content">
            <ha-alert alert-type="error">${this._error}</ha-alert>
          </div>
        </ha-card>
      `;const t=function(e,t){if(!t||0===t.length)return e;const i=new Map(e.map(e=>[e.ref.id,e])),s=[];for(const e of t){const t=i.get(e);t&&s.push(t)}return s}(this._presets&&this._userPresets?fe(this._favoriteRefs,this._presets,this._userPresets,this._getSelectedDeviceTypes()):[],this._config?.preset_ids);if(0===t.length)return B`
        <ha-card .header=${e}>
          <div class="card-content empty">
            <ha-icon icon="mdi:star-off-outline"></ha-icon>
            <p>${this._t.empty_no_favorites}</p>
          </div>
        </ha-card>
      `;const i=this._config.layout||"grid",s=!0===this._config.brightness_override,r=this._config.brightness_override_position||"header";return B`
      <ha-card .header=${e}>
        ${s&&"footer"!==r?this._renderBrightnessSlider():G}
        ${this._renderLayout(i,t,e)}
        ${s&&"footer"===r?this._renderBrightnessSlider():G}
      </ha-card>
    `}_renderLayout(e,t,i){switch(e){case"list":return this._renderListLayout(t);case"hero":return this._renderHeroLayout(t);case"carousel":return this._renderCarouselLayout(t);case"grid":case"compact-grid":return this._renderGridLayout(t,e,i);default:return e}}_getDisplayFlags(){return{showNames:!1!==this._config?.show_names,highlightUser:!1!==this._config?.highlight_user_presets}}_renderGridLayout(e,t,i){const s="compact-grid"===t,{showNames:r,highlightUser:o}=this._getDisplayFlags(),n=this._config?.columns?`grid-template-columns: repeat(${this._config.columns}, 1fr)`:"";return B`
      <div class="preset-grid ${s?"compact":""} ${r?"":"no-names"} ${i?"":"no-title"}" style=${n||G}>
        ${e.map(({ref:e,preset:t,isUser:i})=>{const s=this._activating===e.id,n=void 0!==this._findActiveOpType(e,t);return B`
            <div
              class="preset-button ${i&&o?"user-preset":"builtin-preset"} ${s?"activating":""} ${n?"active":""}"
              role="button"
              tabindex="0"
              aria-label="${t.name}"
              @click=${()=>this._activatePreset(e,t,i)}
              @keydown=${s=>{"Enter"===s.key&&this._activatePreset(e,t,i)}}
            >
              <div class="preset-icon">
                ${Ve(e,t,i)}
              </div>
              ${r?B`<div class="preset-name">${t.name}</div>`:G}
              ${s?B`<div class="activating-overlay"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`:G}
            </div>
          `})}
      </div>
    `}_renderListLayout(e){const{showNames:t,highlightUser:i}=this._getDisplayFlags();return B`
      <div class="preset-list">
        ${e.map(({ref:e,preset:s,isUser:r})=>{const o=this._activating===e.id,n=void 0!==this._findActiveOpType(e,s);return B`
            <div
              class="preset-list-row ${r&&i?"user-preset":"builtin-preset"} ${n?"active":""} ${o?"activating":""}"
              role="button"
              tabindex="0"
              aria-label="${s.name}"
              @click=${()=>this._activatePreset(e,s,r)}
              @keydown=${t=>{"Enter"===t.key&&this._activatePreset(e,s,r)}}
            >
              <div class="preset-list-icon">${Ve(e,s,r)}</div>
              ${t?B`<div class="preset-list-name">${s.name}</div>`:G}
              ${n?B`<ha-icon class="preset-list-active-indicator" icon="mdi:circle-medium"></ha-icon>`:G}
              ${o?B`<ha-circular-progress indeterminate size="small"></ha-circular-progress>`:G}
            </div>
          `})}
      </div>
    `}_renderHeroLayout(e){const t=e[0];if(!t)return B``;const i=e.slice(1);return B`
      <div class="preset-hero-wrapper">
        ${this._renderHeroTile(t)}
        ${i.length>0?B`<div class="preset-hero-strip">${i.map(e=>this._renderStripTile(e))}</div>`:G}
      </div>
    `}_renderHeroTile({ref:e,preset:t,isUser:i}){const s=void 0!==this._findActiveOpType(e,t),r=this._activating===e.id,{showNames:o}=this._getDisplayFlags();return B`
      <div
        class="preset-hero ${s?"active":""} ${r?"activating":""}"
        role="button"
        tabindex="0"
        aria-label="${t.name}"
        @click=${()=>this._activatePreset(e,t,i)}
        @keydown=${s=>{"Enter"===s.key&&this._activatePreset(e,t,i)}}
      >
        <div class="preset-hero-icon">${Ve(e,t,i)}</div>
        ${o?B`<div class="preset-hero-name">${t.name}</div>`:G}
        ${r?B`<div class="activating-overlay"><ha-circular-progress indeterminate size="small"></ha-circular-progress></div>`:G}
      </div>
    `}_renderStripTile({ref:e,preset:t,isUser:i}){const s=void 0!==this._findActiveOpType(e,t),r=this._activating===e.id;return B`
      <div
        class="preset-strip-tile ${s?"active":""} ${r?"activating":""}"
        role="button"
        tabindex="0"
        aria-label="${t.name}"
        @click=${()=>this._activatePreset(e,t,i)}
        @keydown=${s=>{"Enter"===s.key&&this._activatePreset(e,t,i)}}
      >
        <div class="preset-strip-icon">${Ve(e,t,i)}</div>
      </div>
    `}_renderCarouselLayout(e){return B`
      <div class="preset-carousel" tabindex="0">
        ${e.map(e=>B`<div class="preset-carousel-item">${this._renderStripTile(e)}</div>`)}
      </div>
    `}_renderBrightnessSlider(){return B`
      <div class="brightness-slider-row">
        <span class="brightness-slider-label">${this._t.brightness_label}</span>
        <input
          type="range"
          min="1"
          max="100"
          .value=${String(this._brightnessValue)}
          @input=${e=>{const t=parseInt(e.target.value,10);isNaN(t)||(this._brightnessValue=t)}}
        />
        <span class="brightness-slider-value">${this._brightnessValue}%</span>
      </div>
    `}};_t._STOP_SERVICES={effect:"stop_effect",cct_sequence:"stop_cct_sequence",segment_sequence:"stop_segment_sequence",dynamic_scene:"stop_dynamic_scene"},_t.styles=n`
    :host {
      display: block;
    }

    /* Fix ha-svg-icon vertical misalignment inside ha-icon-button */
    ha-icon-button > ha-icon {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-content {
      padding: 16px;
    }

    .card-content.loading {
      display: flex;
      justify-content: center;
      padding: 32px 16px;
    }

    .card-content.empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 24px 16px;
      color: var(--secondary-text-color);
    }

    .card-content.empty ha-icon {
      --mdc-icon-size: 32px;
      opacity: 0.5;
    }

    .card-content.empty p {
      margin: 0;
      font-size: var(--ha-font-size-s, 13px);
    }

    /* Preset grid */
    .preset-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 12px;
      padding: 0 16px 16px;
    }

    .preset-grid.no-title {
      padding-top: 16px;
    }

    /* Preset buttons — copied from styles.ts:820-910 */
    .preset-button {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 12px;
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      position: relative;
      min-height: 80px;
      overflow: hidden;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .preset-button::before {
      content: '';
      position: absolute;
      inset: 0;
      background: var(--primary-color);
      opacity: 0;
      transition: opacity 0.15s ease-in-out;
    }

    .preset-button:hover::before {
      opacity: 0.08;
    }

    .preset-button:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
    }

    .preset-button:active {
      transform: translateY(0);
    }

    .preset-button.user-preset {
      border-color: var(--primary-color);
      border-style: dashed;
      border-width: 2px;
    }

    .preset-button.user-preset:hover {
      border-style: solid;
    }

    .preset-button.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
      box-shadow: 0 0 8px rgba(var(--rgb-primary-color, 3, 169, 244), 0.3);
    }

    .preset-button.active::before {
      opacity: 0.1;
    }

    .preset-button.active.user-preset {
      border-style: solid;
    }

    .preset-button.activating {
      opacity: 0.6;
      pointer-events: none;
    }

    .activating-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(var(--rgb-card-background-color, 255, 255, 255), 0.6);
      border-radius: inherit;
    }

    .preset-name {
      font-size: var(--ha-font-size-s, 13px);
      font-weight: var(--ha-font-weight-medium, 500);
      text-align: center;
      margin-top: 8px;
      position: relative;
      word-break: break-word;
    }

    .preset-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preset-icon img,
    .preset-icon svg {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }

    .preset-icon ha-icon {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 56px;
    }

    /*
     * Audio-reactive badge overlay.
     * The badge is rendered as a child of the icon container regardless of
     * which layout (grid/list/hero/carousel) is in use. To make the absolute
     * positioning work in every layout, ensure each icon container is a
     * positioning context, and target the badge with a single shared rule.
     */
    .preset-icon,
    .preset-list-icon,
    .preset-hero-icon,
    .preset-strip-icon {
      position: relative;
    }

    .audio-badge {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .audio-badge ha-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      --mdc-icon-size: 20px;
    }

    /* Compact icon containers (40px) get a smaller badge so it isn't oversized. */
    .preset-list-icon .audio-badge,
    .preset-strip-icon .audio-badge {
      width: 18px;
      height: 18px;
    }
    .preset-list-icon .audio-badge ha-icon,
    .preset-strip-icon .audio-badge ha-icon {
      width: 16px;
      height: 16px;
      --mdc-icon-size: 16px;
    }

    /* No names — larger icons fill the space */
    .no-names .preset-icon {
      width: 64px;
      height: 64px;
    }

    .no-names .preset-icon ha-icon {
      --mdc-icon-size: 64px;
    }

    .no-names .preset-button {
      min-height: 68px;
    }

    /* No names + compact combined */
    .compact.no-names .preset-icon {
      width: 48px;
      height: 48px;
    }

    .compact.no-names .preset-icon ha-icon {
      --mdc-icon-size: 48px;
    }

    .compact.no-names .preset-button {
      min-height: 48px;
    }

    /* Compact mode — tighter layout for narrow cards */
    .preset-grid.compact {
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      gap: 8px;
      padding: 0 8px 8px;
    }

    .preset-grid.compact.no-title {
      padding-top: 8px;
    }

    .compact .preset-button {
      padding: 8px 4px;
      min-height: 56px;
    }

    .compact .preset-icon {
      width: 40px;
      height: 40px;
    }

    .compact .preset-icon ha-icon {
      --mdc-icon-size: 40px;
    }

    .compact .preset-name {
      font-size: var(--ha-font-size-xs, 11px);
      margin-top: 4px;
    }

    /* Mobile responsive */
    @media (max-width: 600px) {
      .preset-grid {
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 8px;
        padding: 0 8px 8px;
      }

      .preset-button {
        padding: 8px;
        min-height: 60px;
      }

      .preset-name {
        font-size: var(--ha-font-size-xs, 11px);
      }
    }

    /* ---------- List layout ---------- */

    .preset-list {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding: 8px 16px 16px;
    }

    .preset-list-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .preset-list-row:hover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.05);
    }

    .preset-list-row.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    }

    .preset-list-row.user-preset {
      border-style: dashed;
    }

    .preset-list-row.user-preset.active {
      border-style: solid;
    }

    .preset-list-row.activating {
      opacity: 0.6;
      pointer-events: none;
    }

    .preset-list-icon {
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preset-list-icon ha-icon,
    .preset-list-icon img,
    .preset-list-icon svg {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 40px;
      object-fit: contain;
      border-radius: 50%;
    }

    .preset-list-name {
      flex: 1;
      font-size: var(--ha-font-size-m, 14px);
    }

    .preset-list-active-indicator {
      color: var(--primary-color);
    }

    /* ---------- Hero layout ---------- */

    .preset-hero-wrapper {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 0 16px 16px;
    }

    .preset-hero {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 12px;
      border: 2px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
      gap: 12px;
      position: relative;
      overflow: hidden;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .preset-hero:hover {
      border-color: var(--primary-color);
    }

    .preset-hero.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    }

    .preset-hero.activating {
      opacity: 0.6;
      pointer-events: none;
    }

    .preset-hero-icon {
      width: 96px;
      height: 96px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preset-hero-icon ha-icon,
    .preset-hero-icon img,
    .preset-hero-icon svg {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 96px;
      object-fit: contain;
      border-radius: 50%;
    }

    .preset-hero-name {
      font-size: var(--ha-font-size-l, 16px);
      font-weight: 500;
      text-align: center;
    }

    .preset-hero-strip {
      display: flex;
      gap: 8px;
      overflow-x: auto;
    }

    .preset-strip-tile {
      flex: 0 0 56px;
      width: 56px;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--divider-color);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.15s ease-in-out;
      position: relative;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
    }

    .preset-strip-tile:hover {
      border-color: var(--primary-color);
    }

    .preset-strip-tile.active {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.15);
    }

    .preset-strip-tile.activating {
      opacity: 0.6;
      pointer-events: none;
    }

    .preset-strip-icon {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .preset-strip-icon ha-icon,
    .preset-strip-icon img,
    .preset-strip-icon svg {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 40px;
      object-fit: contain;
      border-radius: 50%;
    }

    /* ---------- Carousel layout ---------- */

    .preset-carousel {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      /* Slightly less bottom padding so the visible scrollbar fits within the card. */
      padding: 0 16px 12px;
      scroll-snap-type: x mandatory;
      outline: none;
      /* Show a thin scrollbar on desktop so users have a visible scroll
         affordance. Touch devices ignore these and use native finger-drag. */
      scrollbar-width: thin;
      scrollbar-color: var(--divider-color) transparent;
    }

    .preset-carousel::-webkit-scrollbar {
      height: 6px;
    }
    .preset-carousel::-webkit-scrollbar-track {
      background: transparent;
    }
    .preset-carousel::-webkit-scrollbar-thumb {
      background: var(--divider-color);
      border-radius: 3px;
    }
    .preset-carousel::-webkit-scrollbar-thumb:hover {
      background: var(--secondary-text-color);
    }

    .preset-carousel:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
    }

    .preset-carousel-item {
      flex: 0 0 auto;
      scroll-snap-align: start;
    }

    /* ---------- Brightness slider ---------- */

    .brightness-slider-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 16px;
    }

    .brightness-slider-row input[type="range"] {
      flex: 1;
      min-width: 0;
      accent-color: var(--primary-color);
    }

    .brightness-slider-label {
      font-size: var(--ha-font-size-m, 14px);
      color: var(--secondary-text-color);
      white-space: nowrap;
    }

    .brightness-slider-value {
      font-size: var(--ha-font-size-m, 14px);
      color: var(--secondary-text-color);
      min-width: 36px;
      text-align: right;
      flex-shrink: 0;
    }
  `,e([pe({attribute:!1})],_t.prototype,"hass",void 0),e([ue()],_t.prototype,"_config",void 0),e([ue()],_t.prototype,"_presets",void 0),e([ue()],_t.prototype,"_userPresets",void 0),e([ue()],_t.prototype,"_favoriteRefs",void 0),e([ue()],_t.prototype,"_supportedEntities",void 0),e([ue()],_t.prototype,"_loading",void 0),e([ue()],_t.prototype,"_error",void 0),e([ue()],_t.prototype,"_activating",void 0),e([ue()],_t.prototype,"_activePresets",void 0),e([ue()],_t.prototype,"_brightnessValue",void 0),_t=ut=e([de("aqara-preset-favorites-card")],_t),window.customCards=window.customCards||[],window.customCards.push({type:"aqara-preset-favorites-card",name:_e.card.name,description:_e.card.description,preview:!1});const{I:gt}=re,ft=e=>e,vt=()=>document.createComment(""),mt=(e,t,i)=>{const s=e._$AA.parentNode,r=void 0===t?e._$AB:t._$AA;if(void 0===i){const t=s.insertBefore(vt(),r),o=s.insertBefore(vt(),r);i=new gt(t,o,e,e.options)}else{const t=i._$AB.nextSibling,o=i._$AM,n=o!==e;if(n){let t;i._$AQ?.(e),i._$AM=e,void 0!==i._$AP&&(t=e._$AU)!==o._$AU&&i._$AP(t)}if(t!==r||n){let e=i._$AA;for(;e!==t;){const t=ft(e).nextSibling;ft(s).insertBefore(e,r),e=t}}}return i},yt=(e,t,i=e)=>(e._$AI(t,i),e),bt={},$t=(e,t=bt)=>e._$AH=t,xt=e=>{e._$AR(),e._$AA.remove()},wt=(e,t,i)=>{const s=new Map;for(let r=t;r<=i;r++)s.set(e[r],r);return s},At=me(class extends ye{constructor(e){if(super(e),e.type!==ve)throw Error("repeat() can only be used in text expressions")}dt(e,t,i){let s;void 0===i?i=t:void 0!==t&&(s=t);const r=[],o=[];let n=0;for(const t of e)r[n]=s?s(t,n):n,o[n]=i(t,n),n++;return{values:o,keys:r}}render(e,t,i){return this.dt(e,t,i).values}update(e,[t,i,s]){const r=(e=>e._$AH)(e),{values:o,keys:n}=this.dt(t,i,s);if(!Array.isArray(r))return this.ut=n,o;const a=this.ut??=[],c=[];let d,l,h=0,p=r.length-1,u=0,_=o.length-1;for(;h<=p&&u<=_;)if(null===r[h])h++;else if(null===r[p])p--;else if(a[h]===n[u])c[u]=yt(r[h],o[u]),h++,u++;else if(a[p]===n[_])c[_]=yt(r[p],o[_]),p--,_--;else if(a[h]===n[_])c[_]=yt(r[h],o[_]),mt(e,c[_+1],r[h]),h++,_--;else if(a[p]===n[u])c[u]=yt(r[p],o[u]),mt(e,r[h],r[p]),p--,u++;else if(void 0===d&&(d=wt(n,u,_),l=wt(a,h,p)),d.has(a[h]))if(d.has(a[p])){const t=l.get(n[u]),i=void 0!==t?r[t]:null;if(null===i){const t=mt(e,r[h]);yt(t,o[u]),c[u]=t}else c[u]=yt(i,o[u]),mt(e,r[h],i),r[t]=null;u++}else xt(r[p]),p--;else xt(r[h]),h++;for(;u<=_;){const t=mt(e,c[_+1]);yt(t,o[u]),c[u++]=t}for(;h<=p;){const e=r[h++];null!==e&&xt(e)}return this.ut=n,$t(e,c),F}});function Et(e){return B`
    <ha-input
      .label=${e.label??""}
      .value=${e.value??""}
      .hint=${e.hint??""}
      type=${e.type??G}
      min=${e.min??G}
      max=${e.max??G}
      class=${e.className??G}
      style=${e.style??G}
      @change=${e.onChange??G}
      @input=${e.onInput??G}
    ></ha-input>
  `}n`
  :host {
    display: block;
  }

  /* Fix ha-svg-icon vertical misalignment inside ha-icon-button.
   * ha-svg-icon sets vertical-align: middle in its shadow DOM.
   * Making ha-icon a flex container neutralizes this. */
  ha-icon-button > ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  ${n`
  /* Editor-content wrapper used by all standalone editors */
  .editor-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .form-row {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row:last-child {
    margin-bottom: 0;
  }

  .form-row-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row-triple {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .form-row-pair .form-field,
  .form-row-triple .form-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-row-pair .form-field .form-label {
    min-width: unset;
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .form-section .form-label {
    min-width: unset;
  }

  .form-label {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    min-width: 120px;
    color: var(--secondary-text-color);
  }

  .field-description {
    font-size: 12px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .form-input {
    flex: 1;
  }

  .form-hint {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    margin-top: -4px;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    align-items: center;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--divider-color);
  }

  .form-actions-left {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-right: auto;
  }

  .unsaved-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--warning-color);
    white-space: nowrap;
  }

  .unsaved-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--warning-color);
    flex-shrink: 0;
  }

  .preview-warning {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    border: 1px solid var(--divider-color);
    border-left: 4px solid var(--warning-color, #ffc107);
    border-radius: 4px;
    font-size: 13px;
  }

  .preview-warning ha-icon {
    flex-shrink: 0;
    --mdc-icon-size: 18px;
  }

  .icon-field-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-field-row ha-selector {
    flex: 1;
  }

  .icon-clear-btn {
    --ha-icon-button-size: 32px;
    --mdc-icon-button-size: 32px;
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
  }

  /* Activation overrides grid - 4 columns desktop, 2 columns mobile */
  .overrides-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 16px 0;
  }

  .override-item {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .override-item .form-label {
    min-width: unset;
    font-size: var(--ha-font-size-s, 12px);
  }

  .brightness-slider {
    padding: 0 16px 8px;
  }

  /* Two-column row for audio override controls, stacks on mobile */
  .audio-override-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-dropdowns-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-sliders-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-toggles-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    padding: 0 16px 8px;
  }

  .audio-toggles-grid .form-section {
    align-items: flex-start;
    margin-bottom: 0;
  }

  /* Responsive form */
  @media (max-width: 600px) {
    .form-row {
      flex-direction: column;
      align-items: stretch;
    }

    .form-row-pair,
    .form-row-triple {
      grid-template-columns: 1fr;
    }

    .audio-override-row {
      grid-template-columns: 1fr;
    }

    .audio-dropdowns-grid {
      grid-template-columns: 1fr;
    }

    .audio-sliders-row {
      grid-template-columns: 1fr;
    }

    .audio-toggles-grid {
      grid-template-columns: 1fr 1fr;
    }

    .form-label {
      min-width: unset;
      margin-bottom: 4px;
    }

    .form-actions .btn-text {
      display: none;
    }

    .form-actions {
      gap: 8px;
    }
  }
`}
`;let St=class extends ae{constructor(){super(...arguments),this._allFavorites=[],this._loaded=!1,this._curationDrag=null,this._loadToken=0,this._t=_e.card,this._onCurationDragStart=(e,t)=>{e.preventDefault(),e.stopPropagation(),this._curationDrag={fromIdx:t,toIdx:t},e.currentTarget.setPointerCapture(e.pointerId),window.addEventListener("pointermove",this._onCurationDragMove),window.addEventListener("pointerup",this._onCurationDragEnd),window.addEventListener("pointercancel",this._onCurationDragEnd)},this._onCurationDragMove=e=>{if(!this._curationDrag)return;const t=this.shadowRoot.querySelectorAll(".curation-row");for(let i=0;i<t.length;i++){const s=t[i].getBoundingClientRect();if(e.clientY>=s.top&&e.clientY<=s.bottom){this._curationDrag={...this._curationDrag,toIdx:i};break}}},this._onCurationDragEnd=()=>{window.removeEventListener("pointermove",this._onCurationDragMove),window.removeEventListener("pointerup",this._onCurationDragEnd),window.removeEventListener("pointercancel",this._onCurationDragEnd);const e=this._curationDrag;if(this._curationDrag=null,!e||e.fromIdx===e.toIdx)return;const t=this._config?.preset_ids?[...this._config.preset_ids]:[],i=new Set(t),s=[];if(this._config?.preset_ids)for(const e of this._config.preset_ids){const t=this._allFavorites.find(t=>t.ref.id===e);t&&s.push(t)}for(const e of this._allFavorites)i.has(e.ref.id)||s.push(e);const[r]=s.splice(e.fromIdx,1);if(!r)return;s.splice(e.toIdx,0,r);const o=s.filter(e=>i.has(e.ref.id)).map(e=>e.ref.id);this._updateConfig("preset_ids",o.length>0?o:void 0)}}setConfig(e){this._config={...e}}willUpdate(e){super.willUpdate(e),!this._loaded&&e.has("hass")&&this.hass?(this._loaded=!0,this._loadFavorites()):this._loaded&&e.has("_config")&&this._loadFavorites()}disconnectedCallback(){super.disconnectedCallback(),this._loadToken++,window.removeEventListener("pointermove",this._onCurationDragMove),window.removeEventListener("pointerup",this._onCurationDragEnd),window.removeEventListener("pointercancel",this._onCurationDragEnd),this._curationDrag=null}async _loadFavorites(){if(!this.hass)return;const e=++this._loadToken;try{const[t,i,s,r]=await Promise.all([rt(this.hass),ot(this.hass,{bypassCache:!0}),nt(this.hass,{bypassCache:!0}),at(this.hass)]);if(e!==this._loadToken)return;const o=this._config?.entities??(this._config?.entity?[this._config.entity]:[]),n=new Map;for(const e of r.entities||[])n.set(e.entity_id,e.device_type);const a=Array.from(new Set(o.map(e=>n.get(e)).filter(e=>!!e))),c=0===o.length;this._allFavorites=fe(s.favorite_presets||[],t,i,a,c?{skipCompatibility:!0}:{})}catch(e){}}render(){return this.hass&&this._config?B`
      <div class="editor">
        <ha-selector
          .hass=${this.hass}
          .label=${this._t.editor.entities_label}
          .selector=${{entity:{domain:"light",multiple:!0}}}
          .value=${this._config.entities||(this._config.entity?[this._config.entity]:[])}
          .required=${!0}
          @value-changed=${e=>{const t=e.detail.value;this._updateConfig("entities",t?.length?t:void 0),this._config.entity&&this._updateConfig("entity",void 0)}}
        ></ha-selector>
        ${Et({label:this._t.editor.title_label,value:this._config.title||"",onInput:e=>this._updateConfig("title",e.target.value)})}
        ${void 0===this._config.layout||"grid"===this._config.layout||"compact-grid"===this._config.layout?Et({label:this._t.editor.columns_label,type:"number",min:"0",max:"6",value:String(this._config.columns||0),onInput:e=>{const t=parseInt(e.target.value,10);this._updateConfig("columns",isNaN(t)||t<=0?void 0:t)}}):""}
        <ha-selector
          .hass=${this.hass}
          .label=${this._t.editor.layout_label}
          .selector=${{select:{mode:"dropdown",options:[{value:"grid",label:this._t.editor.layout_grid},{value:"compact-grid",label:this._t.editor.layout_compact_grid},{value:"list",label:this._t.editor.layout_list},{value:"hero",label:this._t.editor.layout_hero},{value:"carousel",label:this._t.editor.layout_carousel}]}}}
          .value=${this._config.layout||"grid"}
          @value-changed=${e=>this._updateConfig("layout",e.detail.value||void 0)}
        ></ha-selector>
        <ha-formfield .label=${this._t.editor.show_names_label}>
          <ha-switch
            .checked=${!1!==this._config.show_names}
            @change=${e=>this._updateConfig("show_names",!!e.target.checked&&void 0)}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield .label=${this._t.editor.highlight_user_label}>
          <ha-switch
            .checked=${!1!==this._config.highlight_user_presets}
            @change=${e=>this._updateConfig("highlight_user_presets",!!e.target.checked&&void 0)}
          ></ha-switch>
        </ha-formfield>
        <ha-formfield .label=${this._t.editor.brightness_override_label}>
          <ha-switch
            .checked=${!0===this._config.brightness_override}
            @change=${e=>this._updateConfig("brightness_override",e.target.checked||void 0)}
          ></ha-switch>
        </ha-formfield>
        ${this._config.brightness_override?B`
            <ha-selector
              .hass=${this.hass}
              .label=${this._t.editor.brightness_override_position_label}
              .selector=${{select:{mode:"dropdown",options:[{value:"header",label:this._t.editor.brightness_override_position_header},{value:"footer",label:this._t.editor.brightness_override_position_footer}]}}}
              .value=${this._config.brightness_override_position||"header"}
              @value-changed=${e=>this._updateConfig("brightness_override_position",e.detail.value||void 0)}
            ></ha-selector>
          `:""}
        ${this._allFavorites.length>0?B`
            <div class="curation-section">
              <span class="curation-label">${this._t.editor.preset_ids_label}</span>
              <span class="curation-help">${this._t.editor.preset_ids_help}</span>
              <div class="curation-list">
                ${this._renderCurationList()}
              </div>
              ${this._config.preset_ids?B`
                  <ha-button
                    @click=${()=>this._updateConfig("preset_ids",void 0)}
                  >${this._t.editor.reset_to_global_button}</ha-button>
                `:""}
            </div>
          `:""}
      </div>
    `:B``}_renderCurationList(){const e=this._config?.preset_ids,t=new Set(e||[]),i=[];if(e)for(const t of e){const e=this._allFavorites.find(e=>e.ref.id===t);e&&i.push(e)}for(const e of this._allFavorites)t.has(e.ref.id)||i.push(e);const s=this._curationDrag,r=s?s.toIdx:-1;return B`${At(i,e=>e.ref.id,(e,i)=>{const o=t.has(e.ref.id),n=["curation-row"];s?.fromIdx===i&&n.push("dragging"),i===r&&s?.fromIdx!==i&&n.push("drop-target");const a=["curation-drag-handle"];return o||a.push("disabled"),B`
          <div class=${n.join(" ")} data-id=${e.ref.id} data-idx=${i}>
            <div
              class=${a.join(" ")}
              @pointerdown=${o?e=>this._onCurationDragStart(e,i):void 0}
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <ha-checkbox
              .checked=${o}
              @change=${t=>this._onCurationCheck(e.ref.id,t.target.checked)}
            ></ha-checkbox>
            <div class="curation-icon">${Ve(e.ref,e.preset,e.isUser,{showAudioBadge:!1})}</div>
            <span class="curation-name">${e.preset.name}</span>
          </div>
        `})}`}_onCurationCheck(e,t){const i=this._config?.preset_ids?[...this._config.preset_ids]:[];if(t&&!i.includes(e))i.push(e);else if(!t){const t=i.indexOf(e);t>=0&&i.splice(t,1)}this._updateConfig("preset_ids",i.length>0?i:void 0)}_updateConfig(e,t){if(!this._config)return;if("layout"===e)return this._config=function(e,t){const i={...e};return void 0===t?delete i.layout:i.layout=t,void 0!==i.compact&&delete i.compact,i}(this._config,t),void this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:this._config}}));const i={...this._config,[e]:t};(void 0===t||""===t&&"title"!==e)&&delete i[e],this._config=i,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:i}}))}};St.styles=n`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
    }
    .curation-section {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .curation-label {
      font-weight: 500;
    }
    .curation-help {
      font-size: 12px;
      color: var(--secondary-text-color);
    }
    .curation-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 360px;
      overflow-y: auto;
      border: 1px solid var(--divider-color);
      border-radius: 6px;
      padding: 4px;
    }
    .curation-row {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 6px;
      border-radius: 4px;
    }
    .curation-row:hover {
      background: var(--secondary-background-color);
    }
    .curation-row.dragging {
      opacity: 0.4;
    }
    .curation-row.drop-target {
      border-top: 3px solid var(--primary-color);
      /* Absorb the border so the row's visual height stays stable. */
      margin-top: -3px;
    }
    .curation-drag-handle {
      cursor: grab;
      padding: 4px;
      touch-action: none;
      user-select: none;
      color: var(--secondary-text-color);
    }
    .curation-drag-handle:active {
      cursor: grabbing;
    }
    .curation-drag-handle.disabled {
      cursor: default;
      opacity: 0.25;
      pointer-events: none;
    }
    .curation-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .curation-icon ha-icon,
    .curation-icon img,
    .curation-icon svg {
      width: 100%;
      height: 100%;
      --mdc-icon-size: 32px;
      object-fit: contain;
      border-radius: 50%;
    }
    .curation-name {
      flex: 1;
    }
  `,e([pe({attribute:!1})],St.prototype,"hass",void 0),e([ue()],St.prototype,"_config",void 0),e([ue()],St.prototype,"_allFavorites",void 0),e([ue()],St.prototype,"_loaded",void 0),e([ue()],St.prototype,"_curationDrag",void 0),St=e([de("aqara-preset-favorites-card-editor")],St)}();
