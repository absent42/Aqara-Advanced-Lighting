!function(){"use strict";function e(e,t,i,s){var o,a=arguments.length,n=a<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)n=Reflect.decorate(e,t,i,s);else for(var r=e.length-1;r>=0;r--)(o=e[r])&&(n=(a<3?o(n):a>3?o(t,i,n):o(t,i))||n);return a>3&&n&&Object.defineProperty(t,i,n),n}"function"==typeof SuppressedError&&SuppressedError;const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let a=class{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=o.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(t,e))}return e}toString(){return this.cssText}};const n=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new a(i,e,s)},r=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new a("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:_}=Object,u=globalThis,g=u.trustedTypes,v=g?g.emptyScript:"",m=u.reactiveElementPolyfillSupport,f=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?v:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},y=(e,t)=>!l(e,t),x={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:y};Symbol.metadata??=Symbol("metadata"),u.litPropertyMetadata??=new WeakMap;let $=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=x){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:o}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const a=s?.call(this);o?.call(this,t),this.requestUpdate(e,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??x}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const e=_(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const e=this.properties,t=[...h(e),...p(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(r(e))}else void 0!==e&&t.push(r(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),o=t.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),o="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=s;const a=o.fromAttribute(t,e.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(e,t,i,s=!1,o){if(void 0!==e){const a=this.constructor;if(!1===s&&(o=this[e]),i??=a.getPropertyOptions(e),!((i.hasChanged??y)(o,t)||i.useDefault&&i.reflect&&o===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:o},a){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),!0!==o||void 0!==a)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}};$.elementStyles=[],$.shadowRootOptions={mode:"open"},$[f("elementProperties")]=new Map,$[f("finalized")]=new Map,m?.({ReactiveElement:$}),(u.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,S=e=>e,C=w.trustedTypes,z=C?C.createPolicy("lit-html",{createHTML:e=>e}):void 0,E="$lit$",k=`lit$${Math.random().toFixed(9).slice(2)}$`,P="?"+k,M=`<${P}>`,A=document,T=()=>A.createComment(""),I=e=>null===e||"object"!=typeof e&&"function"!=typeof e,D=Array.isArray,q="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,B=/-->/g,U=/>/g,R=RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),F=/'/g,L=/"/g,H=/^(?:script|style|textarea|title)$/i,N=(e=>(t,...i)=>({_$litType$:e,strings:t,values:i}))(1),j=Symbol.for("lit-noChange"),G=Symbol.for("lit-nothing"),W=new WeakMap,V=A.createTreeWalker(A,129);function Z(e,t){if(!D(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==z?z.createHTML(t):t}const Y=(e,t)=>{const i=e.length-1,s=[];let o,a=2===t?"<svg>":3===t?"<math>":"",n=O;for(let t=0;t<i;t++){const i=e[t];let r,l,c=-1,d=0;for(;d<i.length&&(n.lastIndex=d,l=n.exec(i),null!==l);)d=n.lastIndex,n===O?"!--"===l[1]?n=B:void 0!==l[1]?n=U:void 0!==l[2]?(H.test(l[2])&&(o=RegExp("</"+l[2],"g")),n=R):void 0!==l[3]&&(n=R):n===R?">"===l[0]?(n=o??O,c=-1):void 0===l[1]?c=-2:(c=n.lastIndex-l[2].length,r=l[1],n=void 0===l[3]?R:'"'===l[3]?L:F):n===L||n===F?n=R:n===B||n===U?n=O:(n=R,o=void 0);const h=n===R&&e[t+1].startsWith("/>")?" ":"";a+=n===O?i+M:c>=0?(s.push(r),i.slice(0,c)+E+i.slice(c)+k+h):i+k+(-2===c?t:h)}return[Z(e,a+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class X{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let o=0,a=0;const n=e.length-1,r=this.parts,[l,c]=Y(e,t);if(this.el=X.createElement(l,i),V.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=V.nextNode())&&r.length<n;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(E)){const t=c[a++],i=s.getAttribute(e).split(k),n=/([.?@])?(.*)/.exec(t);r.push({type:1,index:o,name:n[2],strings:i,ctor:"."===n[1]?te:"?"===n[1]?ie:"@"===n[1]?se:ee}),s.removeAttribute(e)}else e.startsWith(k)&&(r.push({type:6,index:o}),s.removeAttribute(e));if(H.test(s.tagName)){const e=s.textContent.split(k),t=e.length-1;if(t>0){s.textContent=C?C.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],T()),V.nextNode(),r.push({type:2,index:++o});s.append(e[t],T())}}}else if(8===s.nodeType)if(s.data===P)r.push({type:2,index:o});else{let e=-1;for(;-1!==(e=s.data.indexOf(k,e+1));)r.push({type:7,index:o}),e+=k.length-1}o++}}static createElement(e,t){const i=A.createElement("template");return i.innerHTML=e,i}}function K(e,t,i=e,s){if(t===j)return t;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const a=I(t)?void 0:t._$litDirective$;return o?.constructor!==a&&(o?._$AO?.(!1),void 0===a?o=void 0:(o=new a(e),o._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(t=K(e,o._$AS(e,t.values),o,s)),t}let J=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??A).importNode(t,!0);V.currentNode=s;let o=V.nextNode(),a=0,n=0,r=i[0];for(;void 0!==r;){if(a===r.index){let t;2===r.type?t=new Q(o,o.nextSibling,this,e):1===r.type?t=new r.ctor(o,r.name,r.strings,this,e):6===r.type&&(t=new oe(o,this,e)),this._$AV.push(t),r=i[++n]}a!==r?.index&&(o=V.nextNode(),a++)}return V.currentNode=A,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}};class Q{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=G,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=K(this,e,t),I(e)?e===G||null==e||""===e?(this._$AH!==G&&this._$AR(),this._$AH=G):e!==this._$AH&&e!==j&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>D(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==G&&I(this._$AH)?this._$AA.nextSibling.data=e:this.T(A.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=X.createElement(Z(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new J(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=W.get(e.strings);return void 0===t&&W.set(e.strings,t=new X(e)),t}k(e){D(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const o of e)s===t.length?t.push(i=new Q(this.O(T()),this.O(T()),this,this.options)):i=t[s],i._$AI(o),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=S(e).nextSibling;S(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ee{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,o){this.type=1,this._$AH=G,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=G}_$AI(e,t=this,i,s){const o=this.strings;let a=!1;if(void 0===o)e=K(this,e,t,0),a=!I(e)||e!==this._$AH&&e!==j,a&&(this._$AH=e);else{const s=e;let n,r;for(e=o[0],n=0;n<o.length-1;n++)r=K(this,s[i+n],t,n),r===j&&(r=this._$AH[n]),a||=!I(r)||r!==this._$AH[n],r===G?e=G:e!==G&&(e+=(r??"")+o[n+1]),this._$AH[n]=r}a&&!s&&this.j(e)}j(e){e===G?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class te extends ee{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===G?void 0:e}}class ie extends ee{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==G)}}class se extends ee{constructor(e,t,i,s,o){super(e,t,i,s,o),this.type=5}_$AI(e,t=this){if((e=K(this,e,t,0)??G)===j)return;const i=this._$AH,s=e===G&&i!==G||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,o=e!==G&&(i===G||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){K(this,e)}}const ae=w.litHtmlPolyfillSupport;ae?.(X,Q),(w.litHtmlVersions??=[]).push("3.3.2");const ne=globalThis;let re=class extends ${constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let o=s._$litPart$;if(void 0===o){const e=i?.renderBefore??null;s._$litPart$=o=new Q(t.insertBefore(T(),e),e,void 0,i??{})}return o._$AI(e),o})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return j}};re._$litElement$=!0,re.finalized=!0,ne.litElementHydrateSupport?.({LitElement:re});const le=ne.litElementPolyfillSupport;le?.({LitElement:re}),(ne.litElementVersions??=[]).push("4.2.2");const ce=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},de={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:y},he=(e=de,t,i)=>{const{kind:s,metadata:o}=i;let a=globalThis.litPropertyMetadata.get(o);if(void 0===a&&globalThis.litPropertyMetadata.set(o,a=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),a.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const o=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,o,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];t.call(this,i),this.requestUpdate(s,o,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};function pe(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}function _e(e){return pe({...e,state:!0,attribute:!1})}function ue(e,t){return(t,i,s)=>((e,t,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof t&&Object.defineProperty(e,t,i),i))(t,i,{get(){return(t=>t.renderRoot?.querySelector(e)??null)(this)}})}const ge=2,ve=e=>(...t)=>({_$litDirective$:e,values:t});class me{constructor(e){}get _$AU(){return this._$AM._$AU}_$AT(e,t,i){this._$Ct=e,this._$AM=t,this._$Ci=i}_$AS(e,t){return this.update(e,t)}update(e,t){return this.render(...t)}}const fe=(e,t)=>{const i=e._$AN;if(void 0===i)return!1;for(const e of i)e._$AO?.(t,!1),fe(e,t);return!0},be=e=>{let t,i;do{if(void 0===(t=e._$AM))break;i=t._$AN,i.delete(e),e=t}while(0===i?.size)},ye=e=>{for(let t;t=e._$AM;e=t){let i=t._$AN;if(void 0===i)t._$AN=i=new Set;else if(i.has(e))break;i.add(e),we(t)}};function xe(e){void 0!==this._$AN?(be(this),this._$AM=e,ye(this)):this._$AM=e}function $e(e,t=!1,i=0){const s=this._$AH,o=this._$AN;if(void 0!==o&&0!==o.size)if(t)if(Array.isArray(s))for(let e=i;e<s.length;e++)fe(s[e],!1),be(s[e]);else null!=s&&(fe(s,!1),be(s));else fe(this,e)}const we=e=>{e.type==ge&&(e._$AP??=$e,e._$AQ??=xe)};class Se extends me{constructor(){super(...arguments),this._$AN=void 0}_$AT(e,t,i){super._$AT(e,t,i),ye(this),this.isConnected=e._$AU}_$AO(e,t=!0){e!==this.isConnected&&(this.isConnected=e,e?this.reconnected?.():this.disconnected?.()),t&&(fe(this,e),be(this))}setValue(e){if((e=>void 0===e.strings)(this._$Ct))this._$Ct._$AI(e,this);else{const t=[...this._$Ct._$AH];t[this._$Ci]=e,this._$Ct._$AI(t,this,0)}}disconnected(){}reconnected(){}}class Ce{}const ze=new WeakMap,Ee=ve(class extends Se{render(e){return G}update(e,[t]){const i=t!==this.G;return i&&void 0!==this.G&&this.rt(void 0),(i||this.lt!==this.ct)&&(this.G=t,this.ht=e.options?.host,this.rt(this.ct=e.element)),G}rt(e){if(this.isConnected||(e=void 0),"function"==typeof this.G){const t=this.ht??globalThis;let i=ze.get(t);void 0===i&&(i=new WeakMap,ze.set(t,i)),void 0!==i.get(this.G)&&this.G.call(this.ht,void 0),i.set(this.G,e),void 0!==e&&this.G.call(this.ht,e)}else this.G.value=e}get lt(){return"function"==typeof this.G?ze.get(this.ht??globalThis)?.get(this.G):this.G?.value}disconnected(){this.lt===this.ct&&this.rt(void 0)}reconnected(){this.rt(this.ct)}}),ke=n`
  /* Base styles - follows HA haStyle patterns */
  :host {
    display: block;
    height: 100%;
    background-color: var(--primary-background-color);
    color: var(--primary-text-color);
    font-family: var(--ha-font-family-body, var(--paper-font-body1_-_font-family, Roboto, sans-serif));
    font-size: var(--ha-font-size-m, 14px);
    line-height: var(--ha-line-height-normal, 1.5);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    /* Prevent layout shift when ha-dialog hides the scrollbar */
    overflow-y: scroll;
    scrollbar-gutter: stable;
  }

  /* Fix ha-svg-icon vertical misalignment inside ha-icon-button.
   * ha-svg-icon sets vertical-align: middle on its :host inside ha-icon's
   * shadow DOM which we can't reach. Making ha-icon a flex container
   * neutralizes the vertical-align on its shadow child. */
  ha-icon-button > ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* HA scrollbar styling (from haStyleScrollbar) */
  ::-webkit-scrollbar {
    width: 0.4rem;
    height: 0.4rem;
  }

  ::-webkit-scrollbar-thumb {
    -webkit-border-radius: 4px;
    border-radius: 4px;
    background: var(--scrollbar-thumb-color, var(--divider-color));
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
`,Pe=n`
  /* Fixed header - follows HA developer-tools pattern */
  .header {
    background-color: var(--app-header-background-color);
    color: var(--app-header-text-color, var(--text-primary-color));
    border-bottom: 1px solid var(--divider-color);
    position: fixed;
    top: 0;
    /* 0px covers the narrow layout, where the sidebar token is unset. */
    left: var(--ha-sidebar-width, 0px);
    right: 0;
    z-index: 4;
    padding-top: env(safe-area-inset-top, 0px);
  }

  :host([narrow]) .header {
    left: 0;
  }

  /* Toolbar - hamburger menu and title */
  .toolbar {
    display: flex;
    align-items: center;
    height: var(--header-height, 56px);
    padding: 0 12px;
    box-sizing: border-box;
  }

  .main-title {
    margin-left: 8px;
    font-size: 20px;
    font-weight: 400;
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ha-tab-group - native HA tab component (same as Developer Tools) */
  ha-tab-group {
    --track-color: var(--divider-color);
    --indicator-color: var(--primary-color);
  }

  ha-tab-group-tab {
    --ha-tab-text-color: var(--secondary-text-color);
    --ha-tab-active-text-color: var(--wa-color-brand-on-quiet);
  }

  /* Content area with padding for fixed header */
  .content {
    padding: calc(var(--header-height, 56px) + 48px + 16px + env(safe-area-inset-top, 0px)) 16px 16px;
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    min-height: 100vh;
  }

  /* HA dialog fullscreen on mobile - follows haStyleDialog. */
  @media all and (max-width: 450px), all and (max-height: 500px) {
    ha-dialog {
      --ha-dialog-width-md: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --ha-dialog-max-width: calc(100vw - env(safe-area-inset-right) - env(safe-area-inset-left));
      --ha-dialog-min-height: 100%;
      --ha-dialog-max-height: 100%;
      --vertical-align-dialog: flex-end;
      --ha-dialog-border-radius: 0;
    }
  }

  /* Version display in toolbar */
  .version-display {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
    margin-left: 8px;
    white-space: nowrap;
  }

  .version-display ha-icon {
    --mdc-icon-size: 14px;
  }

  .version-display .version-text {
    line-height: 1.3;
  }

  .version-display.version-mismatch {
    color: var(--warning-color);
  }

  .setup-badge {
    margin-right: 4px;
    padding: 1px 6px;
    background: var(--primary-color);
    color: var(--text-primary-color);
    border-radius: 8px;
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: 500;
    white-space: nowrap;
  }

  /* Responsive scaffold */
  @media (max-width: 600px) {
    .content {
      padding: calc(var(--header-height, 56px) + 48px + 8px + env(safe-area-inset-top, 0px)) 8px 8px;
    }

    .toolbar {
      padding: 0 4px;
    }

    .main-title {
      font-size: 18px;
    }

    ha-tab-group-tab {
      font-size: 12px;
    }
  }
`,Me=n`
  /* Controls section - now using ha-card */
  ha-card.controls {
    padding: 16px;
    margin-bottom: 24px;
  }

  .control-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 16px;
  }

  .control-row:last-child {
    margin-bottom: 0;
  }

  /* Desktop layout: Target and Favorites side by side */
  .target-favorites-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  .target-favorites-grid .control-row {
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    .target-favorites-grid {
      grid-template-columns: 1fr 1fr;
    }
  }

  .control-label {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
    line-height: var(--ha-line-height-condensed, 1.2);
  }

  .quick-controls-label {
    color: var(--secondary-text-color);
  }

  .control-input {
    width: 100%;
  }

  .control-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .control-buttons ha-button {
    flex: 1 1 auto;
    min-width: 140px;
  }

  .control-buttons ha-icon {
    margin-right: 4px;
  }

  /* ha-expansion-panel styling for sections - follows HA patterns */
  ha-expansion-panel {
    --expansion-panel-content-padding: 0 16px 16px 16px;
    --ha-card-border-radius: var(--ha-card-border-radius, 12px);
    margin-bottom: 16px;
    display: block;
  }

  ha-expansion-panel[outlined] {
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    background: var(--card-background-color);
  }

  /* Expansion panel header styling */
  ha-expansion-panel .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    cursor: default;
    margin-bottom: 0;
    user-select: none;
    padding: 8px;
  }

  ha-expansion-panel .section-header-controls {
    margin-right: 0;
  }

  /* Expansion panel content - consistent 16px padding */
  ha-expansion-panel .section-content {
    padding: 0;
  }

  /* Controls content inside expansion panel - flex column layout instead of grid */
  ha-expansion-panel .section-content.controls-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* Legacy section styling for ha-card - follows HA patterns */
  ha-card.section {
    --ha-card-background: var(--card-background-color, var(--primary-background-color));
    --ha-card-border-radius: var(--ha-card-border-radius, 12px);
    padding: 16px;
    margin-bottom: 16px;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    cursor: pointer;
    user-select: none;
  }

  .section-title {
    font-size: var(--ha-font-size-l, 18px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--primary-text-color);
  }

  .section-subtitle {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .section-header-controls {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Sort dropdown - compact inline select using ha-selector */
  .sort-select {
    min-width: 80px;
    max-width: 110px;
  }

  /* Preset grid - uses HA layout patterns */
  .section-content {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  .section-content.collapsed {
    display: none;
  }

  /* Light tile card container - uses HA grid patterns */
  .light-tile-container {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }

  .light-tile-container hui-tile-card {
    --ha-card-background: var(--card-background-color);
    --ha-card-border-radius: var(--ha-card-border-radius, 12px);
    display: block;
    width: 100%;
  }

  /* Responsive sections */
  @media (max-width: 600px) {
    .light-tile-container {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
    }

    .section-content {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    }

    /* Sort dropdown mobile styles */
    .sort-select {
      min-width: 80px;
    }

    .section-header-controls {
      gap: 4px;
    }
  }
`,Ae=n`
  /* Preset buttons - follows HA card interaction patterns */
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
    transition: all 0.15s ease-in-out;
    min-height: 80px;
    position: relative;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
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

  .preset-button.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .preset-button.disabled:hover {
    border-color: var(--divider-color);
    transform: none;
    box-shadow: none;
  }

  .preset-button.disabled::before {
    opacity: 0;
  }

  .preset-name {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    text-align: center;
    margin-top: 8px;
    position: relative;
  }

  .preset-icon {
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
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

  /* Audio-reactive DOM badge overlay */
  .preset-icon .audio-badge {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
    color: #fff;
    pointer-events: none;
  }

  .preset-icon .audio-badge ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    --mdc-icon-size: 20px;
  }

  /* User preset button styling in Activate tab */
  .preset-button.user-preset {
    border-color: var(--primary-color);
    border-style: dashed;
    border-width: 2px;
  }

  .preset-button.user-preset:hover {
    border-style: solid;
  }

  /* My Presets management section content */
  .preset-management-content {
    display: block;
  }

  /* Preset grid for My Presets tab */
  .preset-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 12px;
  }

  /* User preset card with action buttons - follows HA card patterns */
  .user-preset-card {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px;
    background: var(--card-background-color);
    border: 2px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
    min-height: 80px;
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
  }

  .user-preset-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .user-preset-card:hover::before {
    opacity: 0.08;
  }

  .user-preset-card:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .user-preset-card:active {
    transform: translateY(0);
  }

  .user-preset-card.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .user-preset-card.disabled:hover {
    border-color: var(--divider-color);
    transform: none;
    box-shadow: none;
  }

  .user-preset-card.disabled::before {
    opacity: 0;
  }

  .user-preset-card .preset-icon {
    font-size: 40px;
    margin-bottom: 8px;
    line-height: 1;
    position: relative;
    --mdc-icon-size: 40px;
  }

  .user-preset-card .preset-name {
    font-size: var(--ha-font-size-s, 12px);
    text-align: center;
    font-weight: var(--ha-font-weight-medium, 500);
    line-height: 1.2;
    word-break: break-word;
    max-width: 100%;
    position: relative;
  }

  /* Action buttons overlay */
  .preset-card-actions {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    gap: 0;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    z-index: 2;
    pointer-events: none;
  }

  .preset-card-actions-right {
    top: auto;
    bottom: 2px;
  }

  .preset-card-actions-left {
    right: auto;
    left: 2px;
  }

  /* Hover devices: show actions on hover */
  @media (hover: hover) {
    .user-preset-card:hover .preset-card-actions,
    .user-preset:hover .preset-card-actions,
    .builtin-preset:hover .preset-card-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Touch edit mode: show actions persistently after long press */
  .user-preset-card.edit-mode .preset-card-actions,
  .user-preset.edit-mode .preset-card-actions,
  .builtin-preset.edit-mode .preset-card-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .user-preset-card.edit-mode,
  .user-preset.edit-mode,
  .builtin-preset.edit-mode {
    border-color: var(--primary-color);
  }

  .preset-card-actions ha-icon-button,
  .preset-card-actions .favorite-star {
    --ha-icon-button-size: 28px;
    --mdc-icon-button-size: 28px;
    --mdc-icon-size: 16px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  @media (hover: hover) {
    .preset-card-actions ha-icon-button:hover,
    .preset-card-actions .favorite-star:hover {
      opacity: 1;
    }
  }

  .preset-card-actions ha-icon-button ha-icon,
  .preset-card-actions .favorite-star ha-icon {
    color: var(--primary-text-color);
  }

  .preset-card-actions .favorite-star.favorited ha-icon {
    color: var(--accent-color, #ffc107);
  }

  /* Select mode checkbox overlay on preset cards */
  .preset-select-checkbox {
    position: absolute;
    top: 4px;
    left: 4px;
    z-index: 2;
    --mdc-icon-size: 20px;
    color: var(--secondary-text-color);
    line-height: 0;
  }

  .user-preset-card.selected {
    border-color: var(--primary-color);
    background: color-mix(in srgb, var(--primary-color) 12%, var(--card-background-color, var(--ha-card-background, white)));
  }

  .user-preset-card.selected .preset-select-checkbox {
    color: var(--primary-color);
  }

  .user-preset-card.select-mode:hover {
    transform: none;
    box-shadow: none;
  }

  .user-preset-card.select-mode:hover::before {
    opacity: 0.05;
  }

  .user-preset-card.select-mode {
    cursor: pointer;
  }

  /* Select mode toolbar highlight */
  .toolbar-select-mode {
    flex-wrap: wrap;
    padding: 8px 12px;
    background: color-mix(in srgb, var(--primary-color) 8%, var(--card-background-color, var(--ha-card-background, white)));
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--primary-color);
  }

  /* Favorites drag-reorder visual feedback. Use outline (not border) so the
     indicator does not shift the grid layout. outline-offset: -2px overlays
     the existing 2px border crisply. */
  .preset-button.drag-source {
    opacity: 0.5;
  }

  .preset-button.drop-target {
    outline: 3px solid var(--primary-color);
    outline-offset: -2px;
  }

  /* Disable native touch gestures (scroll, pinch) on the favorites drag
     handle so vertical-scroll on touch devices does not compete with
     pointer-based drag-reorder. Mirrors the editor's curation-drag-handle. */
  .favorites-drag-handle {
    touch-action: none;
  }

  /* Responsive presets */
  @media (max-width: 600px) {
    .preset-button {
      padding: 8px;
      min-height: 60px;
    }

    .preset-name {
      font-size: var(--ha-font-size-xs, 11px);
    }

    .preset-grid {
      grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 8px;
    }

    .user-preset-card {
      padding: 8px;
      min-height: 60px;
    }

    .user-preset-card .preset-icon {
      font-size: 36px;
      margin-bottom: 4px;
      --mdc-icon-size: 36px;
    }

    .user-preset-card .preset-name {
      font-size: var(--ha-font-size-xs, 11px);
    }
  }
`,Te=n`
  /* Target input with selector and toggle row */
  .target-input {
    display: flex;
    flex-direction: column;
    gap: 0;
    min-width: 0;
    width: 100%;
  }

  /* Target selector container */
  .target-selector {
    width: 100%;
  }

  .target-selector ha-selector {
    display: block;
    width: 100%;
  }

  .include-all-lights-toggle {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
    flex-shrink: 0;
  }

  .has-selection .include-all-lights-toggle {
    margin-top: -30px;
    pointer-events: none;
  }

  .include-all-lights-toggle .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    cursor: pointer;
    white-space: nowrap;
    pointer-events: auto;
  }

  /* Save-as-favorite action bar */
  .save-favorite-bar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    margin-top: 10px;
    background: rgba(var(--rgb-primary-color), 0.06);
    border: 1px dashed rgba(var(--rgb-primary-color), 0.3);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: background 0.15s ease, border-color 0.15s ease;
    font-family: inherit;
    font-size: var(--ha-font-size-m, 14px);
    color: var(--primary-color);
    width: 100%;
    box-sizing: border-box;
    -webkit-tap-highlight-color: transparent;
  }

  .save-favorite-bar:hover {
    background: rgba(var(--rgb-primary-color), 0.12);
    border-color: var(--primary-color);
  }

  .save-favorite-bar:active {
    background: rgba(var(--rgb-primary-color), 0.18);
  }

  .save-favorite-bar ha-icon {
    --mdc-icon-size: 20px;
    flex-shrink: 0;
  }

  .save-favorite-bar span {
    font-weight: var(--ha-font-weight-medium, 500);
    white-space: nowrap;
  }

  /* Favorites empty state */
  .favorites-empty-state {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 16px;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
    border: 1px dashed var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    min-height: 48px;
  }

  .favorites-empty-state ha-icon {
    --mdc-icon-size: 20px;
    opacity: 0.5;
    flex-shrink: 0;
  }

  /* Favorites container - compact grid layout */
  .favorites-container {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  @media (min-width: 768px) {
    .favorites-container {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }
  }

  .favorite-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px 8px 8px;
    background: var(--card-background-color);
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    overflow: hidden;
  }

  .favorite-button::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--primary-color);
    opacity: 0;
    transition: opacity 0.15s ease-in-out;
  }

  .favorite-button:hover::before {
    opacity: 0.08;
  }

  .favorite-button:hover {
    border-color: var(--primary-color);
    transform: translateY(-2px);
    box-shadow: var(--ha-card-box-shadow, 0 4px 8px rgba(0, 0, 0, 0.1));
  }

  .favorite-button:active {
    transform: translateY(0);
  }

  .favorite-button.selected {
    border-color: var(--primary-color);
    border-width: 2px;
  }

  .favorite-button.selected::before {
    opacity: 0.12;
  }

  .favorite-button-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: rgba(var(--rgb-primary-color), 0.2);
    border-radius: var(--ha-card-border-radius, 10px);
    flex-shrink: 0;
    transition: all 0.2s ease-in-out;
    position: relative;
    z-index: 1;
  }

  .favorite-button-icon ha-icon {
    --mdc-icon-size: 32px;
    color: var(--primary-color);
  }

  .favorite-button:hover .favorite-button-icon {
    background: rgba(var(--rgb-primary-color), 0.3);
  }

  .favorite-button:hover .favorite-button-icon ha-icon {
    color: var(--primary-color);
  }

  .favorite-button-content {
    flex: 1;
    width: 100%;
    text-align: center;
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .favorite-button-name {
    font-size: 13px;
    font-weight: 500;
    color: var(--primary-text-color);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.3;
  }

  .favorite-button-count {
    font-size: 11px;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .favorite-button-actions {
    position: absolute;
    top: 2px;
    right: 2px;
    display: flex;
    gap: 0;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    z-index: 2;
    pointer-events: none;
  }

  .favorite-button-actions-left {
    right: auto;
    left: 2px;
  }

  /* Hover devices: show actions on hover */
  @media (hover: hover) {
    .favorite-button:hover .favorite-button-actions {
      opacity: 1;
      pointer-events: auto;
    }
  }

  /* Touch edit mode: show actions persistently after long press */
  .favorite-button.edit-mode .favorite-button-actions {
    opacity: 1;
    pointer-events: auto;
  }

  .favorite-button.edit-mode {
    border-color: var(--primary-color);
  }

  .favorite-button-action {
    --ha-icon-button-size: 28px;
    --mdc-icon-button-size: 28px;
    --mdc-icon-size: 16px;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  @media (hover: hover) {
    .favorite-button-action:hover {
      opacity: 1;
    }
  }

  .favorite-button-action ha-icon {
    color: var(--primary-text-color);
  }

  /* Inline rename input */
  .favorite-rename-input {
    width: 100%;
    font-size: 13px;
    font-weight: 500;
    font-family: inherit;
    color: var(--primary-text-color);
    background: var(--input-fill-color, rgba(var(--rgb-primary-color), 0.05));
    border: 1px solid var(--primary-color);
    border-radius: 6px;
    padding: 4px 8px;
    outline: none;
    text-align: center;
    box-sizing: border-box;
  }

  .favorite-button.renaming {
    cursor: default;
  }

  .favorite-button.renaming .favorite-button-actions,
  .favorite-button.renaming.edit-mode .favorite-button-actions {
    opacity: 0;
    pointer-events: none;
  }

  /* Favorite button states */
  .favorite-button.state-off .favorite-button-icon {
    opacity: 0.4;
  }

  .favorite-button.state-off .favorite-button-count {
    opacity: 0.6;
  }

  .favorite-button.state-unavailable .favorite-button-icon {
    opacity: 0.3;
    filter: grayscale(100%);
  }

  .favorite-button.state-unavailable .favorite-button-count {
    opacity: 0.5;
  }

  .favorite-button.state-on:hover .favorite-button-icon {
    filter: none;
  }

  .favorite-button.state-off:hover .favorite-button-icon {
    opacity: 1;
    filter: none;
  }

  .favorite-button.state-unavailable:hover .favorite-button-icon {
    opacity: 1;
    filter: none;
  }

  /* Music sync section */
  .music-sync-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (min-width: 768px) {
    .music-sync-content {
      grid-template-columns: 1fr 1fr;
      gap: 16px 24px;
    }
  }

  .music-sync-left {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: center;
  }

  .music-sync-right {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: opacity 0.2s ease;
  }

  .music-sync-right.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .music-sync-right .control-label {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
  }

  .music-sync-toggle .toggle-label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  .music-sync-sensitivity-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
    transition: opacity 0.2s ease;
  }

  .music-sync-sensitivity-group.disabled {
    opacity: 0.4;
    pointer-events: none;
  }

  .music-sync-sensitivity-group .control-label {
    font-size: var(--ha-font-size-s, 13px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
  }

  .music-sync-sensitivity {
    display: flex;
    gap: 8px;
  }

  .music-sync-sensitivity ha-button {
    font-size: var(--ha-font-size-s, 13px);
  }

  .music-sync-sensitivity ha-button[appearance="outlined"]::part(base) {
    border-color: var(--divider-color);
  }

  .music-sync-effects {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
  }

  .preset-button.music-sync-active {
    border-color: var(--primary-color);
    background: rgba(var(--rgb-primary-color), 0.12);
  }

  .preset-button.music-sync-active .preset-name {
    color: var(--primary-color);
  }

  .music-sync-effects .effect-icon {
    width: 100%;
    height: 100%;
    background-color: var(--primary-text-color);
    -webkit-mask-size: contain;
    mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-position: center;
  }

  .preset-button.music-sync-active .effect-icon {
    background-color: var(--primary-color);
  }

  /* Responsive activate */
  @media (max-width: 600px) {
    /* Target selector takes full width on mobile */
    .target-selector {
      min-width: 100%;
    }

    /* Favorite input mobile - buttons below text field */
    .favorite-input-container {
      flex-direction: column;
      align-items: stretch;
    }

    .favorite-input-container ha-selector {
      width: 100%;
      min-width: unset;
    }

    .favorite-input-buttons {
      justify-content: flex-end;
    }

    .overrides-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .music-sync-content {
      grid-template-columns: 1fr;
    }
  }
`,Ie=n`
  /* Transition settings responsive grid - mobile first */
  .transition-settings-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .transition-curve-column {
    border-bottom: 1px solid var(--divider-color);
  }

  .initial-brightness-column {
    display: flex;
    flex-direction: column;
  }

  .initial-brightness-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    height: 100%;
    box-sizing: border-box;
  }

  .initial-brightness-content .form-section {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .initial-brightness-content .form-label {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
    margin-bottom: 16px;
  }

  /* Desktop view - side by side layout */
  @media (min-width: 768px) {
    .transition-settings-grid {
      grid-template-columns: 1fr 1fr;
    }

    .transition-curve-column {
      border-bottom: none;
      border-right: 1px solid var(--divider-color);
    }
  }

  :host([narrow]) .transition-settings-grid {
    grid-template-columns: 1fr;
  }

  :host([narrow]) .transition-curve-column {
    border-right: none;
    border-bottom: 1px solid var(--divider-color);
  }

  /* Compatibility warning in editor tabs */
  .compatibility-warning {
    margin-bottom: 16px;
  }

  /* Dimming settings responsive grid - mobile first */
  .dimming-settings-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0;
  }

  .dimming-setting-item {
    border-bottom: 1px solid var(--divider-color);
  }

  .dimming-setting-item:last-child {
    border-bottom: none;
  }

  .dimming-setting-content {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .dimming-setting-content .form-label {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--secondary-text-color);
  }

  .entity-not-found {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
  }

  /* Desktop view - 2x2 grid layout for dimming settings */
  @media (min-width: 768px) {
    .dimming-settings-grid {
      grid-template-columns: 1fr 1fr;
    }

    .dimming-setting-item {
      border-bottom: 1px solid var(--divider-color);
    }

    .dimming-setting-item:nth-child(odd) {
      border-right: 1px solid var(--divider-color);
    }

    .dimming-setting-item:nth-last-child(-n+2) {
      border-bottom: none;
    }
  }

  :host([narrow]) .dimming-settings-grid {
    grid-template-columns: 1fr;
  }

  :host([narrow]) .dimming-setting-item {
    border-bottom: 1px solid var(--divider-color);
  }

  :host([narrow]) .dimming-setting-item:nth-child(odd) {
    border-right: none;
  }

  :host([narrow]) .dimming-setting-item:last-child {
    border-bottom: none;
  }

  /* Curve control styles for transition settings */
  .curve-control-row {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 12px;
  }

  .curve-control-info {
    flex: 1;
  }

  .curve-control-actions {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .curve-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .legend-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .legend-dot.fast-slow {
    background: var(--warning-color, #ffc107);
  }

  .legend-dot.linear {
    background: var(--success-color, #4caf50);
  }

  .legend-dot.slow-fast {
    background: var(--primary-color, #03a9f4);
  }

  /* Mobile: stack curve controls */
  @media (max-width: 767px) {
    .curve-control-row {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }

    .curve-control-actions {
      justify-content: space-between;
    }

    .curve-legend {
      justify-content: center;
    }
  }

  /* Instance card grid styles */
  .instance-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    padding: 16px;
  }

  .instance-card {
    background: var(--card-background-color, var(--ha-card-background));
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .instance-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .instance-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: var(--ha-font-size-xs, 11px);
    font-weight: var(--ha-font-weight-bold, 600);
    letter-spacing: 0.03em;
    text-transform: uppercase;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .instance-badge--z2m {
    background: #e1a700;
    color: #1a1400;
  }

  .instance-badge--zha {
    background: #db4437;
    color: #fff;
  }

  .instance-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .instance-name {
    font-size: var(--ha-font-size-l, 16px);
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--primary-text-color);
    word-break: break-word;
  }

  .instance-topic {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    word-break: break-word;
  }

  .instance-type-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .instance-type-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: var(--ha-font-size-xs, 11px);
    font-weight: var(--ha-font-weight-medium, 500);
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    white-space: nowrap;
  }

  .instance-device-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding-top: 6px;
    border-top: 1px solid var(--divider-color);
  }

  .instance-device-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 10px;
    border-radius: 14px;
    font-size: var(--ha-font-size-s, 12px);
    background: var(--secondary-background-color);
    color: var(--primary-text-color);
    white-space: nowrap;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .instance-device-chip--more {
    cursor: pointer;
    color: var(--primary-color);
    background: transparent;
    border: 1px solid var(--primary-color);
    max-width: none;
  }

  .instance-device-chip--more:hover {
    background: var(--primary-color);
    color: var(--text-primary-color, #fff);
  }

  /* Mobile adjustments for instance cards */
  @media (max-width: 480px) {
    .instance-grid {
      grid-template-columns: 1fr;
      padding: 12px;
      gap: 12px;
    }

    .instance-type-chips {
      gap: 4px;
    }

    .instance-device-chips {
      gap: 4px;
    }
  }

  /* Segment zone management styles */
  .zone-device-section {
    padding: 16px;
    border-bottom: 1px solid var(--divider-color);
  }

  .zone-device-section:last-child {
    border-bottom: none;
  }

  .zone-device-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: var(--ha-font-weight-medium, 500);
    color: var(--primary-text-color);
  }

  .zone-device-segments {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    font-weight: normal;
    margin-left: auto;
  }

  .zone-device-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }

  .zone-device-toolbar .toolbar-spacer {
    flex: 1;
  }

  .zone-unsaved-indicator {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--ha-font-size-s, 12px);
    color: var(--warning-color);
  }

  .zone-unsaved-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--warning-color);
  }

  .zone-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 24px 16px;
    color: var(--secondary-text-color);
  }

  .zone-empty-state ha-icon {
    --mdc-icon-size: 40px;
    opacity: 0.5;
  }

  .zone-empty-state .zone-empty-title {
    font-size: var(--ha-font-size-m, 14px);
    font-weight: var(--ha-font-weight-medium, 500);
  }

  .zone-empty-state .zone-empty-hint {
    font-size: var(--ha-font-size-s, 12px);
    text-align: center;
    max-width: 280px;
  }

  .zone-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 12px;
  }

  .zone-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 12px;
    border: 1px solid var(--divider-color);
    border-left: 3px solid var(--primary-color);
    border-radius: var(--ha-border-radius-sm, 4px);
    background: var(--secondary-background-color);
  }

  .zone-row-header {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .zone-name-input {
    flex: 1;
    min-width: 0;
  }

  .zone-row-header ha-icon-button {
    color: var(--secondary-text-color);
    transition: color 0.2s ease;
  }

  .zone-row-header ha-icon-button:hover {
    color: var(--error-color);
  }

  /* Responsive config */
  @media (max-width: 600px) {
    .zone-btn-label {
      display: none;
    }
  }
`,De=n`
  /* Loading state - follows HA patterns */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 40px;
    font-size: var(--ha-font-size-m, 16px);
    color: var(--secondary-text-color);
  }

  /* HA native ha-alert component styling */
  ha-alert {
    display: block;
    margin-bottom: 16px;
  }

  .no-lights {
    text-align: center;
    padding: 40px;
    color: var(--secondary-text-color);
    font-size: var(--ha-font-size-m, 14px);
  }

  ha-selector {
    display: block;
    width: 100%;
  }

  ha-slider {
    width: 100%;
  }

  /* Tab content area */
  .tab-content {
    min-height: 200px;
  }

  /* Editor form styles - now using ha-card, follows HA form patterns */
  ha-card.editor-form {
    padding: 16px;
  }

  .editor-form h2 {
    font-size: var(--ha-font-size-xl, 20px);
    font-weight: var(--ha-font-weight-medium, 500);
    margin: 0 0 8px 0;
    color: var(--primary-text-color);
  }

  /* Step list styles - follows HA list patterns */
  .step-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .step-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    border: 1px solid var(--divider-color);
  }

  .step-number {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--primary-color);
    color: var(--text-primary-color);
    border-radius: 50%;
    font-size: var(--ha-font-size-s, 12px);
    font-weight: var(--ha-font-weight-medium, 600);
    flex-shrink: 0;
  }

  .step-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .step-row {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  .step-field {
    flex: 1;
    min-width: 120px;
  }

  .step-field-label {
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .step-actions {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .step-actions ha-icon-button {
    --ha-icon-button-size: 32px;
    --mdc-icon-button-size: 32px;
    --mdc-icon-size: 18px;
  }

  .add-step-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px;
    border: 2px dashed var(--divider-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    cursor: pointer;
    color: var(--secondary-text-color);
    transition: all 0.15s ease-in-out;
  }

  .add-step-btn:hover {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--secondary-background-color);
  }

  /* Segment grid editor - follows HA grid patterns */
  .segment-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
    gap: 4px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
  }

  .segment-cell {
    aspect-ratio: 1;
    border-radius: var(--ha-border-radius-sm, 4px);
    cursor: pointer;
    border: 2px solid var(--divider-color);
    transition: all 0.15s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--ha-font-size-xs, 10px);
    font-weight: var(--ha-font-weight-medium, 600);
    color: var(--secondary-text-color);
  }

  .segment-cell:hover {
    transform: scale(1.1);
    z-index: 1;
  }

  .segment-cell.selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  .segment-cell.colored {
    border-color: transparent;
  }

  .preset-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Preset list item - follows HA list-item patterns */
  .preset-list-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    background: var(--card-background-color);
    border-radius: var(--ha-border-radius-sm, 8px);
    border: 1px solid var(--divider-color);
    cursor: pointer;
    transition: all 0.15s ease-in-out;
  }

  .preset-list-item:hover {
    background: var(--secondary-background-color);
  }

  .preset-list-item-info {
    flex: 1;
  }

  .preset-list-item-name {
    font-weight: var(--ha-font-weight-medium, 500);
    font-size: var(--ha-font-size-m, 14px);
  }

  .preset-list-item-description {
    font-size: var(--ha-font-size-s, 12px);
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

  .preset-list-item-meta {
    font-size: var(--ha-font-size-xs, 11px);
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .preset-list-item-actions {
    display: flex;
    gap: 4px;
  }

  .preset-list-item-actions ha-icon-button {
    --ha-icon-button-size: 32px;
    --mdc-icon-button-size: 32px;
    --mdc-icon-size: 18px;
  }

  .empty-state {
    text-align: center;
    padding: 40px;
    color: var(--secondary-text-color);
  }

  .empty-state-icon {
    --mdc-icon-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }

  .empty-state-text {
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Editor description */
  .editor-description {
    font-size: var(--ha-font-size-m, 14px);
    color: var(--secondary-text-color);
    margin-bottom: 24px;
    line-height: var(--ha-line-height-normal, 1.5);
  }

  /* Placeholder styles */
  .coming-soon {
    text-align: center;
    padding: 60px 20px;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
    border: 2px dashed var(--divider-color);
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Toolbar actions for export/import buttons */
  .toolbar-actions {
    display: flex;
    gap: 8px;
    margin: 16px 0;
  }

  .toolbar-actions ha-button {
    font-size: var(--ha-font-size-s, 13px);
  }

  /* No presets empty state - follows HA empty state patterns */
  .no-presets {
    text-align: center;
    padding: 60px 20px;
    color: var(--secondary-text-color);
    background: var(--card-background-color);
    border-radius: var(--ha-card-border-radius, 12px);
  }

  .no-presets ha-icon {
    --mdc-icon-size: 48px;
    opacity: 0.5;
    margin-bottom: 16px;
    display: block;
  }

  .no-presets p {
    margin: 8px 0;
    font-size: var(--ha-font-size-m, 14px);
  }

  /* Responsive editor host */
  @media (max-width: 600px) {
    .step-row {
      flex-direction: column;
    }

    .step-field {
      min-width: unset;
    }
  }
`,qe=n`
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
`,Oe=n`
  /* =========================================
   * UNIFORM COLOR PICKER STYLES
   * Standard variant: for color arrays (Effects, Gradient, Blocks, Sequence Steps)
   * Palette variant: for pattern-editor Individual mode (selectable fixed colors)
   * ========================================= */

  /* Color picker container */
  .color-picker-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }

  /* Individual color item wrapper */
  .color-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  /* Color swatch - 48px for good touch targets */
  .color-swatch {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    cursor: pointer;
    border: 2px solid var(--divider-color);
    transition: all 0.2s ease;
  }

  .color-swatch:hover {
    transform: scale(1.05);
    border-color: var(--primary-color);
  }

  /* Hidden native input overlays the swatch */
  .color-swatch input[type="color"] {
    position: absolute;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    top: 0;
    left: 0;
    border: none;
    padding: 0;
  }

  /* Edit/Remove button below color swatch */
  .color-edit-btn {
    padding: 4px;
    background: var(--secondary-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .color-edit-btn:hover {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  .color-edit-btn ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Delete button variant */
  .color-remove {
    padding: 4px;
    background: var(--secondary-background-color);
    border: 1px solid var(--divider-color);
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .color-remove:hover {
    background: var(--error-color);
    color: var(--text-primary-color);
  }

  .color-remove ha-icon {
    --mdc-icon-size: 16px;
  }

  /* Invisible spacer to maintain alignment when delete button is hidden */
  .color-remove-spacer {
    height: 26px;
    visibility: hidden;
  }

  /* Add color button - matches color-item layout */
  .add-color-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    gap: 4px;
    flex-shrink: 0;
  }

  .add-color-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border: 2px dashed var(--divider-color);
    border-radius: 8px;
    cursor: pointer;
    color: var(--secondary-text-color);
    background: transparent;
    transition: all 0.15s ease;
  }

  .add-color-btn:not(.disabled):hover .add-color-icon {
    border-color: var(--primary-color);
    color: var(--primary-color);
    background: var(--secondary-background-color);
  }

  .add-color-btn.disabled {
    opacity: 0.4;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* Drag handle above color swatch */
  .color-drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 20px;
    color: var(--secondary-text-color);
    cursor: grab;
    touch-action: none;
    -webkit-user-select: none;
    user-select: none;
    transition: color 0.2s ease;
  }

  .color-drag-handle:hover {
    color: var(--primary-color);
  }

  .color-drag-handle:active {
    cursor: grabbing;
  }

  .color-drag-handle ha-icon {
    --mdc-icon-size: 18px;
  }

  /* Invisible spacer matching drag handle height when handle is hidden */
  .color-drag-handle-spacer {
    height: 20px;
  }

  /* Suppress swatch hover effect during drag */
  .color-picker-grid.is-dragging .color-swatch:hover {
    transform: none;
  }

  /* Suppress add button during drag */
  .color-picker-grid.is-dragging .add-color-btn {
    pointer-events: none;
    opacity: 0.4;
  }

  /* =========================================
   * PALETTE VARIANT
   * For pattern-editor Individual mode (selectable fixed colors)
   * ========================================= */

  /* Palette container */
  .color-palette {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
  }

  /* Palette color wrapper with edit button */
  .palette-color-wrapper {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  /* Selectable palette swatch */
  .palette-color {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 3px solid var(--divider-color);
    cursor: pointer;
    transition: all 0.15s ease;
    flex-shrink: 0;
  }

  .palette-color:hover {
    transform: scale(1.08);
  }

  .palette-color.selected {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px var(--primary-color);
  }

  /* Small edit button below palette swatch */
  .palette-edit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    background: var(--secondary-background-color);
    color: var(--secondary-text-color);
    cursor: pointer;
    padding: 0;
    transition: all 0.15s ease;
    --mdc-icon-size: 14px;
  }

  .palette-edit-btn:hover {
    background: var(--primary-color);
    color: var(--text-primary-color);
  }

  /* Color picker ha-dialog sizing:
   * Fixed width sized for 8 color history swatches:
   * 8 x 32px swatches + 7 x 6px gaps = 298px content + 48px padding = 346px
   */
  ha-dialog {
    --ha-dialog-width-md: min(346px, calc(100vw - 32px));
    --ha-dialog-max-width: min(346px, calc(100vw - 32px));
  }

  ha-dialog [slot="headerActionItems"] {
    margin-right: 12px;
  }

  ha-dialog [slot="footer"] {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
  }

  .color-picker-modal-preview {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    border: 2px solid var(--divider-color);
  }

  ha-dialog.extractor-dialog {
    --ha-dialog-width-md: min(420px, calc(100vw - 32px));
    --ha-dialog-max-width: min(420px, calc(100vw - 32px));
  }

  ha-dialog.extractor-dialog image-color-extractor {
    min-height: 200px;
  }

  .extractor-mode-toggle {
    display: flex;
    gap: 4px;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 8px;
    padding: 3px;
    margin: 0 auto;
  }

  .extractor-mode-toggle .mode-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--primary-text-color);
    font-size: 12px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .extractor-mode-toggle .mode-btn.active {
    background: var(--card-background-color, #fff);
    box-shadow: 0 1px 3px rgba(0,0,0,0.12);
  }

  .extractor-mode-toggle .mode-btn ha-icon {
    --mdc-icon-size: 16px;
  }
`;function Be(e){return Math.round(1e4*e)/1e4}function Ue(e,t,i=255){if(0===t)return{r:0,g:0,b:0};const s=1/t*e,o=1/t*(1-e-t);let a=3.2406*s-1.5372+-.4986*o,n=-.9689*s+1.8758+.0415*o,r=.0557*s-.204+1.057*o;const l=Math.max(a,n,r);l>1&&(a/=l,n/=l,r/=l),a=Math.max(0,a),n=Math.max(0,n),r=Math.max(0,r),a=a<=.0031308?12.92*a:1.055*Math.pow(a,1/2.4)-.055,n=n<=.0031308?12.92*n:1.055*Math.pow(n,1/2.4)-.055,r=r<=.0031308?12.92*r:1.055*Math.pow(r,1/2.4)-.055;const c=i/255;return{r:Math.max(0,Math.min(255,Math.round(255*a*c))),g:Math.max(0,Math.min(255,Math.round(255*n*c))),b:Math.max(0,Math.min(255,Math.round(255*r*c)))}}function Re(e,t,i){let s=e/255,o=t/255,a=i/255;s=s>.04045?Math.pow((s+.055)/1.055,2.4):s/12.92,o=o>.04045?Math.pow((o+.055)/1.055,2.4):o/12.92,a=a>.04045?Math.pow((a+.055)/1.055,2.4):a/12.92;const n=.4124*s+.3576*o+.1805*a,r=.2126*s+.7152*o+.0722*a,l=n+r+(.0193*s+.1192*o+.9505*a);return 0===l?{x:.3127,y:.329}:{x:Be(n/l),y:Be(r/l)}}function Fe(e){const t=e=>e.toString(16).padStart(2,"0");return`#${t(e.r)}${t(e.g)}${t(e.b)}`}function Le(e,t=255){return Fe(Ue(e.x,e.y,t))}function He(e,t,i){const s=e/255,o=t/255,a=i/255,n=Math.max(s,o,a),r=n-Math.min(s,o,a);let l=0,c=0;return 0!==n&&(c=r/n*100),0!==r&&(l=n===s?(o-a)/r%6:n===o?(a-s)/r+2:(s-o)/r+4,l=Math.round(60*l),l<0&&(l+=360)),{h:l,s:Math.round(c)}}function Ne(e,t){const i=1*(t/100),s=i*(1-Math.abs(e/60%2-1)),o=1-i;let a=0,n=0,r=0;return e>=0&&e<60?(a=i,n=s,r=0):e>=60&&e<120?(a=s,n=i,r=0):e>=120&&e<180?(a=0,n=i,r=s):e>=180&&e<240?(a=0,n=s,r=i):e>=240&&e<300?(a=s,n=0,r=i):(a=i,n=0,r=s),{r:Math.round(255*(a+o)),g:Math.round(255*(n+o)),b:Math.round(255*(r+o))}}function je(e){const t=Ue(e.x,e.y,255);return He(t.r,t.g,t.b)}function Ge(e){const t=Ne(e.h,e.s);return Re(t.r,t.g,t.b)}function We(e){const t=je(e);return Ge({h:(t.h+180)%360,s:t.s})}function Ve(e){const t=e/100;let i,s,o;return t<=66?i=255:(i=329.698727446*Math.pow(t-60,-.1332047592),i=Math.max(0,Math.min(255,i))),s=t<=66?99.4708025861*Math.log(t)-161.1195681661:288.1221695283*Math.pow(t-60,-.0755148492),s=Math.max(0,Math.min(255,s)),t>=66?o=255:t<=19?o=0:(o=138.5177312231*Math.log(t-10)-305.0447927307,o=Math.max(0,Math.min(255,o))),{r:Math.round(i),g:Math.round(s),b:Math.round(o)}}function Ze(e){const t=Ve(e);return Re(t.r,t.g,t.b)}const Ye=[{x:.68,y:.31},{x:.17,y:.7},{x:.15,y:.06},{x:.42,y:.51},{x:.38,y:.16},{x:.22,y:.33}],Xe=[{x:.68,y:.31},{x:.15,y:.06}],Ke=[{x:.68,y:.31},{x:.17,y:.7}];function Je(e,t,i,s,o){return N`
    <div slot="footer">
      <ha-button @click=${i}>${e}</ha-button>
      <ha-button @click=${s}>
        ${o?N`<ha-icon icon=${o}></ha-icon>`:G}
        ${t}
      </ha-button>
    </div>
  `}function Qe(e){return N`
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
  `}const et={t1:"T1 (20 segments)",t1m:"T1M (26 segments)",t1_strip:"T1 Strip (up to 50 segments)"},tt={t2_bulb:"T2 Bulb",...et};function it(e,t,i){const s=t.split(".");let o=e;for(const e of s){if("object"!=typeof o||!(e in o))return t;const i=o[e];if(void 0===i)return t;o=i}let a="string"==typeof o?o:t;return i&&Object.entries(i).forEach(([e,t])=>{a=a.replace(`{${e}}`,t)}),a}function st(e){return[{value:"once",label:e("options.loop_mode_once")},{value:"count",label:e("options.loop_mode_count")},{value:"continuous",label:e("options.loop_mode_continuous")}]}function ot(e,t="options.end_behavior_restore"){return[{value:"maintain",label:e("options.end_behavior_maintain")},{value:"turn_off",label:e("options.end_behavior_turn_off")},{value:"restore",label:e(t)}]}const at=n`
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

  ${qe}
`,nt={colorHistory:[],sortPreferences:{},collapsed:{instances:!0},includeAllLights:!1,favoritePresets:[],useStaticSceneMode:!1,useDistributionModeOverride:!1,distributionModeOverride:"shuffle_rotate",useCustomBrightness:!1,brightness:100,useAudioReactive:!1,audioOverrideEntity:"",audioOverrideSensitivity:50,audioOverrideTransitionSpeed:50,audioOverrideColorAdvance:"on_onset",audioOverrideDetectionMode:"spectral_flux",audioOverridePredictionAggressiveness:50,audioOverrideLatencyCompensationMs:150,audioOverrideSilenceBehavior:"slow_cycle",audioOverrideFrequencyZone:!1,audioOverrideBrightnessCurve:"linear",audioOverrideBrightnessMin:30,audioOverrideBrightnessMax:100,audioOverrideColorByFrequency:!1,audioOverrideRolloffBrightness:!1,useEffectAudioReactive:!1,effectAudioOverrideSensitivity:50,effectAudioOverrideSilenceBehavior:"hold",hiddenBuiltinPresets:[],selectedEntities:[],activeFavoriteId:null,ignoreExternalChanges:!1,overrideControlMode:"pause_changed",softwareTransitionEntities:[],bareTurnOnOnly:!1,detectNonHaChanges:!1,entityAudioConfig:{}};class rt{constructor(e){this.host=e,e.addController(this),this.state={...nt,collapsed:{...nt.collapsed}}}hostConnected(){}hostDisconnected(){void 0!==this._saveTimer&&(clearTimeout(this._saveTimer),this._saveTimer=void 0)}async load(e){if(e){try{const t=await e.callApi("GET","aqara_advanced_lighting/user_preferences");if(0===t.color_history.length&&0===Object.keys(t.sort_preferences).length){const t=this._migrateLocalStoragePreferences();if(t){const i=await e.callApi("PUT","aqara_advanced_lighting/user_preferences",t);return this._applyUserPreferences(i),localStorage.removeItem("aqara_lighting_color_history"),void localStorage.removeItem("aqara_lighting_sort_preferences")}}this._applyUserPreferences(t)}catch(e){this._loadSortPreferencesFromLocalStorage()}try{const t=await e.callApi("GET","aqara_advanced_lighting/global_preferences");void 0!==t.ignore_external_changes&&(this.state.ignoreExternalChanges=t.ignore_external_changes),t.override_control_mode&&(this.state.overrideControlMode=t.override_control_mode),t.software_transition_entities&&(this.state.softwareTransitionEntities=t.software_transition_entities),void 0!==t.bare_turn_on_only&&(this.state.bareTurnOnOnly=t.bare_turn_on_only),void 0!==t.detect_non_ha_changes&&(this.state.detectNonHaChanges=t.detect_non_ha_changes),t.entity_audio_config&&(this.state.entityAudioConfig=t.entity_audio_config)}catch(e){}this.host.requestUpdate()}}_applyUserPreferences(e){this.state.colorHistory=e.color_history,this.state.sortPreferences=e.sort_preferences,this.state.favoritePresets=e.favorite_presets||[],this.state.hiddenBuiltinPresets=e.hidden_builtin_presets||[],e.collapsed_sections&&(this.state.collapsed=e.collapsed_sections),void 0!==e.include_all_lights&&(this.state.includeAllLights=e.include_all_lights),void 0!==e.static_scene_mode&&(this.state.useStaticSceneMode=e.static_scene_mode),e.distribution_mode_override&&(this.state.useDistributionModeOverride=!0,this.state.distributionModeOverride=e.distribution_mode_override),null!=e.brightness_override&&(this.state.useCustomBrightness=!0,this.state.brightness=e.brightness_override),void 0!==e.use_audio_reactive&&(this.state.useAudioReactive=e.use_audio_reactive),e.audio_override_entity&&(this.state.audioOverrideEntity=e.audio_override_entity),void 0!==e.audio_override_sensitivity&&(this.state.audioOverrideSensitivity=e.audio_override_sensitivity),void 0!==e.audio_override_color_advance&&(this.state.audioOverrideColorAdvance=e.audio_override_color_advance),void 0!==e.audio_override_transition_speed&&(this.state.audioOverrideTransitionSpeed=e.audio_override_transition_speed),void 0!==e.audio_override_brightness_curve&&(this.state.audioOverrideBrightnessCurve=e.audio_override_brightness_curve),void 0!==e.audio_override_brightness_min&&(this.state.audioOverrideBrightnessMin=e.audio_override_brightness_min),void 0!==e.audio_override_brightness_max&&(this.state.audioOverrideBrightnessMax=e.audio_override_brightness_max),void 0!==e.audio_override_detection_mode&&(this.state.audioOverrideDetectionMode=e.audio_override_detection_mode),void 0!==e.audio_override_frequency_zone&&(this.state.audioOverrideFrequencyZone=e.audio_override_frequency_zone),void 0!==e.audio_override_silence_behavior&&(this.state.audioOverrideSilenceBehavior=e.audio_override_silence_behavior),void 0!==e.audio_override_prediction_aggressiveness&&(this.state.audioOverridePredictionAggressiveness=e.audio_override_prediction_aggressiveness),void 0!==e.audio_override_latency_compensation_ms&&(this.state.audioOverrideLatencyCompensationMs=e.audio_override_latency_compensation_ms),void 0!==e.audio_override_color_by_frequency&&(this.state.audioOverrideColorByFrequency=e.audio_override_color_by_frequency),void 0!==e.audio_override_rolloff_brightness&&(this.state.audioOverrideRolloffBrightness=e.audio_override_rolloff_brightness),void 0!==e.use_effect_audio_reactive&&(this.state.useEffectAudioReactive=e.use_effect_audio_reactive),void 0!==e.effect_audio_override_sensitivity&&(this.state.effectAudioOverrideSensitivity=e.effect_audio_override_sensitivity),void 0!==e.effect_audio_override_silence_behavior&&(this.state.effectAudioOverrideSilenceBehavior=e.effect_audio_override_silence_behavior),e.selected_entities&&e.selected_entities.length>0&&(this.state.selectedEntities=e.selected_entities,this.state.activeFavoriteId=e.active_favorite_id??null),this.host.requestUpdate()}_migrateLocalStoragePreferences(){const e={};let t=!1;try{const i=localStorage.getItem("aqara_lighting_color_history");if(i){const s=JSON.parse(i);Array.isArray(s)&&s.length>0&&(e.color_history=s,t=!0)}}catch{}try{const i=localStorage.getItem("aqara_lighting_sort_preferences");if(i){const s=JSON.parse(i);s&&"object"==typeof s&&Object.keys(s).length>0&&(e.sort_preferences=s,t=!0)}}catch{}return t?e:null}_loadSortPreferencesFromLocalStorage(){try{const e=localStorage.getItem("aqara_lighting_sort_preferences");e&&(this.state.sortPreferences=JSON.parse(e),this.host.requestUpdate())}catch{}}save(e,t=!1){if(!e)return;void 0!==this._saveTimer&&(clearTimeout(this._saveTimer),this._saveTimer=void 0);const i=()=>{e.callApi("PUT","aqara_advanced_lighting/user_preferences",{color_history:this.state.colorHistory,sort_preferences:this.state.sortPreferences,collapsed_sections:this.state.collapsed,include_all_lights:this.state.includeAllLights,favorite_presets:this.state.favoritePresets,hidden_builtin_presets:this.state.hiddenBuiltinPresets,static_scene_mode:this.state.useStaticSceneMode,distribution_mode_override:this.state.useDistributionModeOverride?this.state.distributionModeOverride:null,brightness_override:this.state.useCustomBrightness?this.state.brightness:null,use_audio_reactive:this.state.useAudioReactive,audio_override_entity:this.state.audioOverrideEntity,audio_override_sensitivity:this.state.audioOverrideSensitivity,audio_override_color_advance:this.state.audioOverrideColorAdvance,audio_override_transition_speed:this.state.audioOverrideTransitionSpeed,audio_override_brightness_curve:this.state.audioOverrideBrightnessCurve,audio_override_brightness_min:this.state.audioOverrideBrightnessMin,audio_override_brightness_max:this.state.audioOverrideBrightnessMax,audio_override_detection_mode:this.state.audioOverrideDetectionMode,audio_override_frequency_zone:this.state.audioOverrideFrequencyZone,audio_override_silence_behavior:this.state.audioOverrideSilenceBehavior,audio_override_prediction_aggressiveness:this.state.audioOverridePredictionAggressiveness,audio_override_latency_compensation_ms:this.state.audioOverrideLatencyCompensationMs,audio_override_color_by_frequency:this.state.audioOverrideColorByFrequency,audio_override_rolloff_brightness:this.state.audioOverrideRolloffBrightness,use_effect_audio_reactive:this.state.useEffectAudioReactive,effect_audio_override_sensitivity:this.state.effectAudioOverrideSensitivity,effect_audio_override_silence_behavior:this.state.effectAudioOverrideSilenceBehavior,selected_entities:this.state.selectedEntities,active_favorite_id:this.state.activeFavoriteId}).catch(e=>{})};t?i():this._saveTimer=setTimeout(i,500)}async saveGlobalPreferences(e){try{await e.callApi("PUT","aqara_advanced_lighting/global_preferences",{ignore_external_changes:this.state.ignoreExternalChanges,override_control_mode:this.state.overrideControlMode,software_transition_entities:this.state.softwareTransitionEntities,bare_turn_on_only:this.state.bareTurnOnOnly,detect_non_ha_changes:this.state.detectNonHaChanges,entity_audio_config:this.state.entityAudioConfig})}catch(e){}}getSortPreference(e){const t=this.state.sortPreferences?.[e];return t||("favorite_presets"===e?"custom":"name-asc")}setSortPreference(e,t,i){this.state.sortPreferences={...this.state.sortPreferences,[e]:t},this.host.requestUpdate(),this.save(i)}setCollapsed(e,t,i){this.state.collapsed={...this.state.collapsed,[e]:t},this.host.requestUpdate(),this.save(i)}update(e,t){Object.assign(this.state,e),this.host.requestUpdate(),this.save(t)}}function lt(e,t){const i=e.states[t];return i&&i.attributes.friendly_name?i.attributes.friendly_name:t.split(".")[1]?.replace(/_/g," ")||t}function ct(e,t){const i=e.states[t];if(i){if(i.attributes.icon)return i.attributes.icon;if("light"===t.split(".")[0])return"mdi:lightbulb"}return"mdi:lightbulb"}function dt(e){const t=e.attributes.supported_color_modes;return!!t&&Array.isArray(t)&&t.some(e=>["xy","hs","rgb","rgbw","rgbww"].includes(e))}function ht(e,t,i,s){const o=e.states[t];if(!o)return null;const a=i.get(t);if(a){if("t1m"===a.device_type)return dt(o)?"t1m":"t1m_white";if(a.device_type&&"unknown"!==a.device_type)return a.device_type}if(s){if(dt(o))return"generic_rgb";const e=o.attributes.supported_color_modes;if(e?.includes("color_temp"))return"generic_cct"}const n=o.attributes.effect_list;if(n&&Array.isArray(n)){if(n.includes("flow1")||n.includes("flow2")||n.includes("rolling"))return"t1m";if(n.includes("rainbow1")||n.includes("rainbow2")||n.includes("chasing")||n.includes("flicker")||n.includes("dash"))return"t1_strip";if(n.includes("candlelight"))return"t2_bulb"}else if(!n&&void 0!==o.attributes.color_temp_kelvin)return"t2_cct";return null}let pt=class extends re{constructor(){super(...arguments),this.operations=[],this.presetLookup=new Map,this._sensitivityDebounceTimer=null,this._squelchDebounceTimer=null,this._effectSensitivityDebounceTimer=null}_localize(e,t){return it(this.translations,e,t)}_getEntityName(e){return lt(this.hass,e)}_getAudioDeviceName(e){return function(e,t){const i=e.entities?.[t];if(i?.device_id&&e.devices){const s=e.devices[i.device_id];if(s)return s.name_by_user||s.name||lt(e,t)}return lt(e,t)}(this.hass,e)}_fireChanged(){this.dispatchEvent(new CustomEvent("operations-changed",{bubbles:!0,composed:!0}))}render(){if(0===this.operations.length)return N`
        <div class="running-ops-empty">
          ${this._localize("target.no_running_operations")}
        </div>
      `;const e=this._buildDisplayOperations(this.operations);return N`
      <div class="running-ops-container">
        <div class="running-ops-list">
          ${e.map(e=>Array.isArray(e)?"effect"===e[0]?.type?this._renderGroupedAudioEffectOp(e):this._renderGroupedSequenceOp(e):this._renderOperationCard(e))}
        </div>
      </div>
    `}_buildDisplayOperations(e){const t=[],i=new Map;for(const s of e){const e=("cct_sequence"===s.type||"segment_sequence"===s.type)&&s.preset_id,o="effect"===s.type&&s.audio_entity&&s.preset_id;if(e||o){const e=`${s.type}:${s.preset_id}`,o=i.get(e);if(void 0!==o){const e=t[o];Array.isArray(e)?e.push(s):t[o]=[e,s]}else i.set(e,t.length),t.push(s)}else t.push(s)}return t}_renderOperationCard(e){switch(e.type){case"effect":return this._renderEffectOp(e);case"cct_sequence":case"segment_sequence":return this._renderSequenceOp(e);case"dynamic_scene":return this._renderSceneOp(e);case"music_sync":return this._renderMusicSyncOp(e);case"circadian":return this._renderCircadianOp(e);default:return""}}_renderEffectOp(e){const t=this._getEntityName(e.entity_id),i=this._resolvePresetInfo(e.preset_id),s=this._localize("target.effect_button");return e.audio_entity?N`
      <div class="running-op-card scene-op-card">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${i.icon||"mdi:palette"}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${i.name||s}</span>
              ${i.name?N`<span class="running-op-entity"><span class="running-op-type">${s}</span></span>`:""}
              ${this._renderAudioInfoRows(e)}
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize("target.stop")}
              @click=${()=>this._stopRunningEffect(e.entity_id)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          <span class="entity-chip">${t}</span>
        </div>
      </div>
    `:N`
        <div class="running-op-card">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${i.icon||"mdi:palette"}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${i.name||s}</span>
              <span class="running-op-entity">
                ${i.name?N`<span class="running-op-type">${s}</span>`:""}
                <span class="running-op-entity-name">${t}</span>
              </span>
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize("target.stop")}
              @click=${()=>this._stopRunningEffect(e.entity_id)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
      `}_renderGroupedAudioEffectOp(e){const t=e[0],i=this._resolvePresetInfo(t.preset_id),s=this._localize("target.effect_button"),o=e.map(e=>{const t=this._getEntityName(e.entity_id);return N`<span class="entity-chip">${t}</span>`});return N`
      <div class="running-op-card scene-op-card">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${i.icon||"mdi:palette"}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${i.name||s}</span>
              ${i.name?N`<span class="running-op-entity"><span class="running-op-type">${s}</span></span>`:""}
              ${this._renderAudioInfoRows(t)}
            </div>
          </div>
          <div class="running-op-actions">
            <ha-icon-button
              .label=${this._localize("target.stop")}
              @click=${()=>this._stopGroupedEffect(e)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${o}
        </div>
      </div>
    `}_renderAudioInfoRows(e){return N`
      <span class="running-op-entity">
        <ha-icon icon="mdi:waveform" style="--mdc-icon-size: 14px; vertical-align: middle;"></ha-icon>
        <span class="running-op-type">${this._localize("target.audio_reactive_label")||"Audio reactive"}</span>
        ${e.audio_entity?N`<span class="running-op-status">${this._getAudioDeviceName(e.audio_entity)}</span>`:""}
      </span>
      ${null!=e.audio_sensitivity?N`
        <div class="audio-sensitivity-row">
          <ha-icon icon="mdi:sine-wave" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
          <span class="sensitivity-label">${this._localize("target.sensitivity")||"Sensitivity"}</span>
          <input type="range" min="1" max="100" .value=${String(e.audio_sensitivity)}
            @input=${t=>this._debounceEffectAudioSensitivity(e.entity_id,parseInt(t.target.value))}
          />
          <span class="sensitivity-value">${e.audio_sensitivity}</span>
        </div>
      `:""}
      ${e.audio_waiting?N`
        <span class="running-op-pause-row">
          <span class="running-op-status paused-text">${this._localize("target.audio_sensor_unavailable")||"Audio sensor unavailable"}</span>
        </span>
      `:""}
    `}_renderSequenceOp(e){const t=this._getEntityName(e.entity_id),i=this._resolvePresetInfo(e.preset_id),s="cct_sequence"===e.type,o=s&&"solar"===e.mode,a=s&&"schedule"===e.mode,n=o?"mdi:white-balance-sunny":a?"mdi:clock-outline":s?"mdi:thermometer":"mdi:led-strip-variant",r=o?this._localize("target.solar_cct_button"):a?this._localize("target.schedule_cct_button"):s?this._localize("target.cct_button"):this._localize("target.segment_button"),l=e.paused||e.externally_paused,c=this._getEntityPauseClass(e.externally_paused,e.override_attributes),d=this._getEntityPauseTitle(e.externally_paused,e.override_attributes,e.auto_resume_remaining);return N`
      <div class="running-op-card ${l?"op-paused":""} ${e.externally_paused?"externally-paused":""}">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="${i.icon||n}"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${i.name||r}</span>
            <span class="running-op-entity">
              ${i.name?N`<span class="running-op-type">${r}</span>`:""}
              <span class="entity-chip ${c}" title="${d}">${t}</span>
            </span>
            ${e.paused?N`
              <span class="running-op-pause-row">
                <span class="running-op-status paused-text">${this._localize("target.paused")}</span>
              </span>
            `:""}
          </div>
        </div>
        <div class="running-op-actions">
          ${e.externally_paused?N`
                <ha-icon-button
                  .label=${this._localize("target.resume_control")}
                  @click=${()=>this._resumeEntityControl(e.entity_id)}
                >
                  <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                </ha-icon-button>
              `:N`
                <ha-icon-button
                  .label=${e.paused?this._localize("target.resume"):this._localize("target.pause")}
                  @click=${()=>this._toggleSequencePause(e)}
                >
                  <ha-icon icon="mdi:${e.paused?"play":"pause"}"></ha-icon>
                </ha-icon-button>
              `}
          <ha-icon-button
            .label=${this._localize("target.stop")}
            @click=${()=>this._stopRunningSequence(e)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_renderGroupedSequenceOp(e){const t=e[0],i=this._resolvePresetInfo(t.preset_id),s="cct_sequence"===t.type,o=s&&"solar"===t.mode,a=s&&"schedule"===t.mode,n=o?"mdi:white-balance-sunny":a?"mdi:clock-outline":s?"mdi:thermometer":"mdi:led-strip-variant",r=o?this._localize("target.solar_cct_button"):a?this._localize("target.schedule_cct_button"):s?this._localize("target.cct_button"):this._localize("target.segment_button"),l=e.some(e=>e.paused),c=e.filter(e=>e.externally_paused),d=l||c.length>0,h=e.map(e=>{const t=this._getEntityName(e.entity_id),i=this._getEntityPauseClass(e.externally_paused,e.override_attributes),s=this._getEntityPauseTitle(e.externally_paused,e.override_attributes,e.auto_resume_remaining);return N`<span class="entity-chip ${i}" title="${s}">${t}</span>`});return N`
      <div class="running-op-card scene-op-card ${d?"op-paused":""}">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${i.icon||n}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${i.name||r}</span>
              ${i.name?N`<span class="running-op-entity"><span class="running-op-type">${r}</span></span>`:""}
              ${l?N`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize("target.paused")}</span>
                </span>
              `:""}
            </div>
          </div>
          <div class="running-op-actions">
            ${c.length>0?N`
                  <ha-icon-button
                    .label=${this._localize("target.resume_control")}
                    @click=${()=>this._resumeSceneEntities(c.map(e=>e.entity_id))}
                  >
                    <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                  </ha-icon-button>
                `:""}
            <ha-icon-button
              .label=${l?this._localize("target.resume"):this._localize("target.pause")}
              @click=${()=>this._toggleGroupedSequencePause(e)}
            >
              <ha-icon icon="mdi:${l?"play":"pause"}"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              .label=${this._localize("target.stop")}
              @click=${()=>this._stopGroupedSequence(e)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${h}
        </div>
      </div>
    `}_renderSceneOp(e){const t=this._resolvePresetInfo(e.preset_id),i=e.externally_paused_entities||[],s=e.override_attributes,o=e.paused||i.length>0,a=(e.entity_ids||[]).map(t=>{const o=this._getEntityName(t),a=e.entity_capabilities?.[t],n=a?.includes("software_transition"),r=i.includes(t),l=r&&s?s[t]:void 0,c=this._getEntityPauseClass(r,l),d=this._getEntityPauseTitle(r,l),h=[];return a?.includes("cct_mode")&&h.push(N`<span class="chip-badge">${this._localize("target.capability_cct")}</span>`),a?.includes("brightness_only")&&h.push(N`<span class="chip-badge">${this._localize("target.capability_brightness")}</span>`),a?.includes("on_off_only")&&h.push(N`<span class="chip-badge">${this._localize("target.capability_on_off")}</span>`),n&&h.push(N`<span class="chip-badge">${this._localize("target.capability_software_transition")}</span>`),N`<span class="entity-chip ${c} ${h.length?"has-badge":""}" title="${d}">${o}${h}</span>`}),n="rich"===e.audio_tier?this._localize("target.audio_tier_rich")||"Beat sync":null;return N`
      <div class="running-op-card scene-op-card ${o?"op-paused":""}">
        <div class="running-op-header">
          <div class="running-op-info">
            <ha-icon class="running-op-icon" icon="${t.icon||"mdi:palette-swatch-variant"}"></ha-icon>
            <div class="running-op-details">
              <span class="running-op-name">${t.name||this._localize("target.scene_button")}</span>
              ${t.name?N`<span class="running-op-entity"><span class="running-op-type">${this._localize("target.scene_button")}</span></span>`:""}
              ${n?N`
                <span class="running-op-entity">
                  <ha-icon icon="mdi:waveform" style="--mdc-icon-size: 14px; vertical-align: middle;"></ha-icon>
                  <span class="running-op-type">${n}</span>
                  ${e.audio_entity?N`<span class="running-op-status">${this._getAudioDeviceName(e.audio_entity)}</span>`:""}
                </span>
              `:""}
              ${null!=e.audio_sensitivity?N`
                <div class="audio-sensitivity-row">
                  <ha-icon icon="mdi:sine-wave" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
                  <span class="sensitivity-label">${this._localize("target.sensitivity")||"Sensitivity"}</span>
                  <input type="range" min="1" max="100" .value=${String(e.audio_sensitivity)}
                    @input=${t=>this._debounceAudioSensitivity(e.scene_id,parseInt(t.target.value))}
                  />
                  <span class="sensitivity-value">${e.audio_sensitivity}</span>
                </div>
              `:""}
              ${null!=e.audio_squelch?N`
                <div class="audio-sensitivity-row">
                  <ha-icon icon="mdi:volume-off" style="--mdc-icon-size: 14px; flex-shrink: 0;"></ha-icon>
                  <span class="sensitivity-label">${this._localize("target.audio_squelch_label")||"Noise gate"}</span>
                  <input type="range" min="0" max="100" .value=${String(e.audio_squelch)}
                    @input=${t=>this._debounceAudioSquelch(e.scene_id,parseInt(t.target.value))}
                  />
                  <span class="sensitivity-value">${e.audio_squelch}</span>
                </div>
              `:""}
              ${e.audio_waiting?N`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize("target.audio_sensor_unavailable")||"Audio sensor unavailable"}</span>
                </span>
              `:""}
              ${e.paused?N`
                <span class="running-op-pause-row">
                  <span class="running-op-status paused-text">${this._localize("target.paused")}</span>
                </span>
              `:""}
            </div>
          </div>
          <div class="running-op-actions">
            ${i.length>0?N`
                  <ha-icon-button
                    .label=${this._localize("target.resume_control")}
                    @click=${()=>this._resumeSceneEntities(i)}
                  >
                    <ha-icon icon="mdi:play-circle-outline"></ha-icon>
                  </ha-icon-button>
                `:""}
            <ha-icon-button
              .label=${e.paused?this._localize("target.resume"):this._localize("target.pause")}
              @click=${()=>this._toggleScenePause(e)}
            >
              <ha-icon icon="mdi:${e.paused?"play":"pause"}"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              .label=${this._localize("target.stop")}
              @click=${()=>this._stopRunningScene(e)}
            >
              <ha-icon icon="mdi:stop"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="entity-chip-list">
          ${a}
        </div>
      </div>
    `}_renderMusicSyncOp(e){const t=this._getEntityName(e.entity_id);return N`
      <div class="running-op-card">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="mdi:music-note"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${this._localize("music_sync.active_label")}</span>
            <span class="running-op-entity">
              <span class="running-op-type">${this._localize("music_sync.title")}</span>
              <span class="running-op-entity-name">${t}</span>
            </span>
          </div>
        </div>
        <div class="running-op-actions">
          <ha-icon-button
            .label=${this._localize("target.stop")}
            @click=${()=>this._stopMusicSync(e.entity_id)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_renderCircadianOp(e){const t=this._getEntityName(e.entity_id),i=this._resolvePresetInfo(e.preset_id);return N`
      <div class="running-op-card">
        <div class="running-op-info">
          <ha-icon class="running-op-icon" icon="${i.icon||"mdi:white-balance-sunny"}"></ha-icon>
          <div class="running-op-details">
            <span class="running-op-name">${i.name||this._localize("target.circadian_label")}</span>
            <span class="running-op-entity">
              ${i.name?N`<span class="running-op-type">${this._localize("target.circadian_label")}</span>`:""}
              <span class="running-op-entity-name">${t}</span>
              ${e.current_color_temp?N`<span class="running-op-status">${e.current_color_temp}K</span>`:""}
            </span>
          </div>
        </div>
        <div class="running-op-actions">
          <ha-icon-button
            .label=${this._localize("target.stop")}
            @click=${()=>this._stopCircadian(e.entity_id)}
          >
            <ha-icon icon="mdi:stop"></ha-icon>
          </ha-icon-button>
        </div>
      </div>
    `}_resolvePresetInfo(e){return e?this.presetLookup.get(e)??{name:e,icon:null}:{name:null,icon:null}}_formatAutoResumeRemaining(e){if(e>=60){return`${Math.ceil(e/60)}m`}return`${e}s`}_getEntityPauseClass(e,t){if(!e)return"";if(t){if(t.brightness&&t.color)return"paused-all";if(t.brightness)return"paused-brightness";if(t.color)return"paused-color"}return"paused-all"}_getEntityPauseTitle(e,t,i){if(!e)return"";let s;return s=t?t.brightness&&t.color?this._localize("target.externally_paused"):t.brightness?this._localize("target.paused_brightness_only"):t.color?this._localize("target.paused_color_only"):this._localize("target.externally_paused"):this._localize("target.externally_paused"),i&&(s+=` (${this._formatAutoResumeRemaining(i)})`),s}_debounceAudioSensitivity(e,t){this._sensitivityDebounceTimer&&clearTimeout(this._sensitivityDebounceTimer),this._sensitivityDebounceTimer=setTimeout(()=>{this._updateAudioSensitivity(e,t)},300)}async _updateAudioSensitivity(e,t){try{await fetch("/api/aqara_advanced_lighting/scene_audio_sensitivity",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.hass.auth.data.access_token}`},body:JSON.stringify({scene_id:e,sensitivity:t})})}catch(e){}}_debounceAudioSquelch(e,t){this._squelchDebounceTimer&&clearTimeout(this._squelchDebounceTimer),this._squelchDebounceTimer=setTimeout(()=>{this._updateAudioSquelch(e,t)},300)}async _updateAudioSquelch(e,t){try{await fetch("/api/aqara_advanced_lighting/scene_audio_squelch",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.hass.auth.data.access_token}`},body:JSON.stringify({scene_id:e,squelch:t})})}catch(e){}}_debounceEffectAudioSensitivity(e,t){this._effectSensitivityDebounceTimer&&clearTimeout(this._effectSensitivityDebounceTimer),this._effectSensitivityDebounceTimer=setTimeout(()=>{this._updateEffectAudioSensitivity(e,t)},300)}async _updateEffectAudioSensitivity(e,t){try{await fetch("/api/aqara_advanced_lighting/effect_audio_sensitivity",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${this.hass.auth.data.access_token}`},body:JSON.stringify({entity_id:e,sensitivity:t})})}catch(e){}}async _stopGroupedEffect(e){await this.hass.callService("aqara_advanced_lighting","stop_effect",{entity_id:e.map(e=>e.entity_id),restore_state:!0}),this._fireChanged()}async _stopRunningEffect(e){await this.hass.callService("aqara_advanced_lighting","stop_effect",{entity_id:[e],restore_state:!0}),this._fireChanged()}async _toggleSequencePause(e){if(!e.entity_id)return;const t="cct_sequence"===e.type,i=e.paused?t?"resume_cct_sequence":"resume_segment_sequence":t?"pause_cct_sequence":"pause_segment_sequence";await this.hass.callService("aqara_advanced_lighting",i,{entity_id:[e.entity_id]}),this._fireChanged()}async _stopRunningSequence(e){if(!e.entity_id)return;const t="cct_sequence"===e.type?"stop_cct_sequence":"stop_segment_sequence";await this.hass.callService("aqara_advanced_lighting",t,{entity_id:[e.entity_id]}),this._fireChanged()}async _toggleGroupedSequencePause(e){const t="cct_sequence"===e[0].type,i=e.some(e=>e.paused)?t?"resume_cct_sequence":"resume_segment_sequence":t?"pause_cct_sequence":"pause_segment_sequence";await this.hass.callService("aqara_advanced_lighting",i,{entity_id:e.map(e=>e.entity_id)}),this._fireChanged()}async _stopGroupedSequence(e){const t="cct_sequence"===e[0].type?"stop_cct_sequence":"stop_segment_sequence";await this.hass.callService("aqara_advanced_lighting",t,{entity_id:e.map(e=>e.entity_id)}),this._fireChanged()}async _toggleScenePause(e){if(!e.entity_ids?.length)return;const t=e.paused?"resume_dynamic_scene":"pause_dynamic_scene";await this.hass.callService("aqara_advanced_lighting",t,{entity_id:e.entity_ids}),this._fireChanged()}async _stopRunningScene(e){e.entity_ids?.length&&(await this.hass.callService("aqara_advanced_lighting","stop_dynamic_scene",{entity_id:e.entity_ids}),this._fireChanged())}async _resumeEntityControl(e){await this.hass.callService("aqara_advanced_lighting","resume_entity_control",{entity_id:[e]}),this._fireChanged()}async _resumeSceneEntities(e){await this.hass.callService("aqara_advanced_lighting","resume_entity_control",{entity_id:e}),this._fireChanged()}async _stopMusicSync(e){await this.hass.callService("aqara_advanced_lighting","set_music_sync",{entity_id:[e],enabled:!1}),this._fireChanged()}async _stopCircadian(e){await this.hass.callService("aqara_advanced_lighting","stop_circadian_mode",{entity_id:[e]}),this._fireChanged()}};function _t(e,t,i,s){const o=i.replace("light.",""),a=`number.${o}_${s}`;if(e.states[a])return a;const n=t.get(i);if(n?.z2m_friendly_name){const t=`number.${n.z2m_friendly_name.toLowerCase().replace(/\s+/g,"_")}_${s}`;if(e.states[t])return t}if(e.entities){const t=e.entities[i];if(t?.device_id)for(const[i,o]of Object.entries(e.entities))if(o.device_id===t.device_id&&i.startsWith("number.")&&i.endsWith(`_${s}`)&&e.states[i])return i}const r=o.toLowerCase().split("_");if(r.length>=2)for(const t of Object.keys(e.states))if(t.startsWith("number.")&&t.endsWith(`_${s}`)){const e=t.slice(7,t.length-s.length-1).toLowerCase().split("_");if(e.length>=2&&r[0]===e[0]&&r[1]===e[1])return t}}pt.styles=n`
    :host {
      display: block;
    }

    .running-ops-container {
      width: 100%;
    }

    .running-ops-empty {
      text-align: center;
      color: var(--secondary-text-color);
      padding: 12px 0;
      font-size: var(--ha-font-size-m, 14px);
    }

    .running-ops-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 8px;
    }

    .running-op-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      background: var(--card-background-color, var(--ha-card-background, #fff));
      border: 1px solid var(--divider-color, #e0e0e0);
      border-left: 3px solid var(--primary-color);
      border-radius: var(--ha-card-border-radius, 12px);
      gap: 8px;
    }

    .running-op-card.scene-op-card {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
    }

    .running-op-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }

    .running-op-card.op-paused {
      border-left-color: var(--disabled-text-color, #999);
      border-left-style: dashed;
    }

    .running-op-card.externally-paused {
      border-color: var(--warning-color, #ff9800);
      border-left-width: 3px;
      border-left-style: dashed;
    }

    .running-op-info {
      display: flex;
      align-items: center;
      gap: 12px;
      flex: 1;
      min-width: 0;
      overflow: hidden;
    }

    .running-op-icon {
      color: var(--primary-color);
      flex-shrink: 0;
      --mdc-icon-size: 20px;
      background: rgba(var(--rgb-primary-color), 0.1);
      border-radius: 50%;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .op-paused .running-op-icon {
      color: var(--disabled-text-color, #999);
      background: rgba(var(--rgb-disabled-color, 158, 158, 158), 0.1);
    }

    .running-op-details {
      display: flex;
      flex-direction: column;
      min-width: 0;
      overflow: hidden;
    }

    .audio-sensitivity-row {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
      min-width: 0;
    }

    .audio-sensitivity-row input[type="range"] {
      flex: 1;
      min-width: 0;
      accent-color: var(--primary-color);
    }

    .audio-sensitivity-row .sensitivity-label {
      font-size: 12px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .audio-sensitivity-row .sensitivity-value {
      font-size: 12px;
      min-width: 24px;
      text-align: right;
      flex-shrink: 0;
    }

    .running-op-name {
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .running-op-type {
      font-size: var(--ha-font-size-xs, 11px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .running-op-entity {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      display: flex;
      align-items: center;
      gap: 6px;
      min-width: 0;
    }

    .running-op-entity-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      min-width: 0;
    }

    .entity-chip-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      padding: 4px 0 4px 44px;
    }

    .entity-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
      padding: 2px 8px;
      border-radius: 12px;
      white-space: nowrap;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    .entity-chip.paused-color {
      background: #d97706;
      color: #fff;
      cursor: help;
    }

    .entity-chip.paused-brightness {
      background: #3b82f6;
      color: #fff;
      cursor: help;
    }

    .entity-chip.paused-all {
      background: #dc2626;
      color: #fff;
      cursor: help;
    }

    .chip-badge {
      font-size: 10px;
      padding: 0 5px;
      border-radius: 8px;
      background: rgba(var(--rgb-primary-color), 0.12);
      color: var(--primary-color);
    }

    .entity-chip.paused-color .chip-badge,
    .entity-chip.paused-brightness .chip-badge,
    .entity-chip.paused-all .chip-badge {
      background: rgba(255, 255, 255, 0.25);
      color: #fff;
    }

    .running-op-status {
      font-weight: var(--ha-font-weight-medium, 500);
    }

    .running-op-status.paused-text {
      color: var(--disabled-text-color, #999);
    }

    .running-op-status.externally-paused-text {
      color: var(--warning-color, #ff9800);
    }

    .running-op-bpm {
      font-size: var(--ha-font-size-xs, 11px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--secondary-text-color);
      margin-left: 6px;
    }

    .running-op-pause-row {
      font-size: var(--ha-font-size-s, 12px);
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .running-op-actions {
      display: flex;
      align-items: center;
      gap: 0;
      flex-shrink: 0;
    }

    .running-op-actions ha-icon-button {
      --ha-icon-button-size: 36px;
      --mdc-icon-button-size: 36px;
      --mdc-icon-size: 20px;
    }
  `,e([pe({attribute:!1})],pt.prototype,"hass",void 0),e([pe({attribute:!1})],pt.prototype,"operations",void 0),e([pe({attribute:!1})],pt.prototype,"presetLookup",void 0),e([pe({attribute:!1})],pt.prototype,"translations",void 0),pt=e([ce("aqara-running-operations")],pt);function ut(e,t){let i=e.filter(e=>!function(e,t){return Be(e.x)===Be(t.x)&&Be(e.y)===Be(t.y)}(e,t));return i=[{x:Be(t.x),y:Be(t.y)},...i],i.length>8&&(i=i.slice(0,8)),i}const gt={draggingIndex:null,dropTargetIndex:null},vt=n`
  .drag-handle {
    cursor: grab;
    display: flex;
    align-items: center;
    color: var(--secondary-text-color);
    padding: 4px;
    touch-action: none;
    transition: color 0.2s ease;
    -webkit-user-select: none;
    user-select: none;
  }

  .drag-handle:hover {
    color: var(--primary-color);
  }

  .drag-handle:active {
    cursor: grabbing;
  }

  .drag-handle ha-icon {
    --mdc-icon-size: 20px;
  }

  .step-item.dragging {
    opacity: 0.4;
  }

  .drop-indicator {
    height: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    margin: -7px 0 -8px 0;
    pointer-events: none;
    z-index: 1;
    position: relative;
  }

  .step-list.is-dragging {
    user-select: none;
    -webkit-user-select: none;
  }

  .grid-drop-indicator {
    position: absolute;
    width: 3px;
    background: var(--primary-color);
    border-radius: 2px;
    pointer-events: none;
    z-index: 10;
  }
`;function mt(t){class i extends t{constructor(){super(...arguments),this._dragState={...gt},this._reorderLayout="list",this._gridDropPos=null,this._boundMove=this._onPointerMove.bind(this),this._boundEnd=this._onPointerEnd.bind(this),this._scrollContainer=null,this._cachedStepList=null,this._autoScrollRaf=0,this._lastClientX=0,this._lastClientY=0}disconnectedCallback(){super.disconnectedCallback(),this._cleanupDrag()}_onDragHandlePointerDown(e,t){if(this._steps.length<=1)return;e.preventDefault(),e.stopPropagation();const i=this.shadowRoot?.querySelector(".step-list");if(!i)return;this._cachedStepList=i,this._scrollContainer=this._findScrollContainer(i),this._dragState={draggingIndex:t,dropTargetIndex:null};const s=i.querySelectorAll(".step-item");s[t]?.classList.add("dragging"),i.classList.add("is-dragging"),this._lastClientX=e.clientX,this._lastClientY=e.clientY,window.addEventListener("pointermove",this._boundMove),window.addEventListener("pointerup",this._boundEnd),window.addEventListener("pointercancel",this._boundEnd),this.requestUpdate()}_onPointerMove(e){null!==this._dragState.draggingIndex&&(e.preventDefault(),this._lastClientX=e.clientX,this._lastClientY=e.clientY,this._updateDropTarget(e.clientX,e.clientY),this._startAutoScroll())}_onPointerEnd(e){if(null===this._dragState.draggingIndex)return;e.preventDefault();const{draggingIndex:t,dropTargetIndex:i}=this._dragState;null!==i&&i!==t&&i!==t+1&&this._reorderStep(t,i),this._cleanupDrag()}_cleanupDrag(){window.removeEventListener("pointermove",this._boundMove),window.removeEventListener("pointerup",this._boundEnd),window.removeEventListener("pointercancel",this._boundEnd),this._autoScrollRaf&&(cancelAnimationFrame(this._autoScrollRaf),this._autoScrollRaf=0);const e=this._cachedStepList;e&&(e.classList.remove("is-dragging"),e.querySelectorAll(".step-item.dragging").forEach(e=>e.classList.remove("dragging"))),this._cachedStepList=null,this._scrollContainer=null,this._gridDropPos=null,this._dragState={...gt},this.requestUpdate()}_updateDropTarget(e,t){const i="grid"===this._reorderLayout?this._calcDropTargetGrid(e,t):this._calcDropTarget(t);i!==this._dragState.dropTargetIndex&&(this._dragState={...this._dragState,dropTargetIndex:i},"grid"===this._reorderLayout&&(this._gridDropPos=this._computeGridIndicatorPos(i)))}_calcDropTarget(e){if(null===this._dragState.draggingIndex)return null;const t=this._cachedStepList;if(!t)return null;const i=t.querySelectorAll(".step-item");if(0===i.length)return null;for(let t=0;t<i.length;t++){const s=i[t].getBoundingClientRect();if(e<s.top+s.height/2)return t}return i.length}_calcDropTargetGrid(e,t){if(null===this._dragState.draggingIndex)return null;const i=this._cachedStepList;if(!i)return null;const s=Array.from(i.querySelectorAll(".step-item"));if(0===s.length)return null;const o=[];for(let e=0;e<s.length;e++){const t=s[e].getBoundingClientRect(),i=t.top+t.height/2;let a=!1;for(const n of o)if(Math.abs(i-(n.top+n.bottom)/2)<4){n.items.push(s[e]),n.indices.push(e),n.top=Math.min(n.top,t.top),n.bottom=Math.max(n.bottom,t.bottom),a=!0;break}a||o.push({items:[s[e]],indices:[e],top:t.top,bottom:t.bottom})}o.sort((e,t)=>e.top-t.top);let a=o[o.length-1];for(const e of o){if(t<(e.top+e.bottom)/2){a=e;break}a=e}for(let t=0;t<a.items.length;t++){const i=a.items[t].getBoundingClientRect();if(e<i.left+i.width/2)return a.indices[t]}return a.indices[a.indices.length-1]+1}_computeGridIndicatorPos(e){if(null===e)return null;const t=this._cachedStepList;if(!t)return null;const i=t.getBoundingClientRect(),s=Array.from(t.querySelectorAll(".step-item"));if(0===s.length)return null;let o,a,n;if(0===e){const e=s[0].getBoundingClientRect();o=e.left-i.left-2,a=e.top-i.top,n=e.height}else if(e>=s.length){const e=s[s.length-1].getBoundingClientRect();o=e.right-i.left+2,a=e.top-i.top,n=e.height}else{const t=s[e-1].getBoundingClientRect(),r=s[e].getBoundingClientRect();Math.abs(t.top-r.top)<4?(o=(t.right+r.left)/2-i.left-1,a=r.top-i.top,n=r.height):(o=r.left-i.left-2,a=r.top-i.top,n=r.height)}return{left:o,top:a,height:n}}_findScrollContainer(e){let t=e;for(;t;){if(!t.parentElement&&t.getRootNode()instanceof ShadowRoot){t=t.getRootNode().host;continue}if(t=t.parentElement,!t)break;const e=getComputedStyle(t).overflowY;if(("auto"===e||"scroll"===e)&&t.scrollHeight>t.clientHeight)return t}return null}_startAutoScroll(){if(this._autoScrollRaf)return;const e=()=>{if(null===this._dragState.draggingIndex)return void(this._autoScrollRaf=0);const t=this._scrollContainer;if(t){{const e=t.getBoundingClientRect(),i=this._lastClientY;if(i<e.top+40&&t.scrollTop>0)t.scrollTop-=8,this._updateDropTarget(this._lastClientX,this._lastClientY);else{if(!(i>e.bottom-40&&t.scrollTop<t.scrollHeight-t.clientHeight))return void(this._autoScrollRaf=0);t.scrollTop+=8,this._updateDropTarget(this._lastClientX,this._lastClientY)}}this._autoScrollRaf=requestAnimationFrame(e)}else this._autoScrollRaf=0};this._autoScrollRaf=requestAnimationFrame(e)}_reorderStep(e,t){const i=[...this._steps],[s]=i.splice(e,1),o=e<t?t-1:t;i.splice(o,0,s),this._steps=i}_renderDragHandle(e){return N`
        <div
          class="drag-handle"
          role="button"
          aria-label="Reorder item ${e+1}"
          @pointerdown=${t=>this._onDragHandlePointerDown(t,e)}
        >
          <ha-icon icon="mdi:drag"></ha-icon>
        </div>
      `}_renderDropIndicator(e){const{draggingIndex:t,dropTargetIndex:i}=this._dragState;return null===t||i!==e?"":N`<div class="drop-indicator"></div>`}_renderGridDropIndicator(){const{draggingIndex:e}=this._dragState;if(null===e||!this._gridDropPos)return"";const{left:t,top:i,height:s}=this._gridDropPos;return N`<div
        class="grid-drop-indicator"
        style="left: ${t}px; top: ${i}px; height: ${s}px;"
      ></div>`}}return e([_e()],i.prototype,"_dragState",void 0),e([_e()],i.prototype,"_gridDropPos",void 0),i}let ft=class extends re{constructor(){super(...arguments),this.colorHistory=[],this.translations={}}_localize(e){return it(this.translations,e)}_handleColorClick(e){this.dispatchEvent(new CustomEvent("color-selected",{detail:{color:e},bubbles:!0,composed:!0}))}_handleClear(){this.dispatchEvent(new CustomEvent("clear-history",{bubbles:!0,composed:!0}))}render(){return N`
      <div class="color-history-section">
        <div class="color-history-header">
          <span class="color-history-label">
            ${this._localize("color_history.recent_colors")}
          </span>
          ${this.colorHistory.length>0?N`
            <button class="color-history-clear" @click=${this._handleClear}>
              ${this._localize("color_history.clear")}
            </button>
          `:""}
        </div>
        <div class="color-history-swatches">
          ${this.colorHistory.map(e=>N`
            <button
              class="color-history-swatch"
              style="background-color: ${Le(e,255)}"
              @click=${()=>this._handleColorClick(e)}
              aria-label="${this._localize("color_history.swatch_label")||"Color"} ${Le(e,255)}"
            ></button>
          `)}
        </div>
      </div>
    `}};ft.styles=n`
    :host {
      display: block;
    }

    .color-history-section {
      margin: 16px 0 0;
      width: 100%;
    }

    .color-history-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .color-history-label {
      font-size: var(--ha-font-size-s, 12px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--secondary-text-color);
    }

    .color-history-clear {
      background: none;
      border: none;
      color: var(--secondary-text-color);
      cursor: pointer;
      font-size: var(--ha-font-size-s, 12px);
      padding: 2px 6px;
      border-radius: 4px;
      transition: all 0.15s ease;
    }

    .color-history-clear:hover {
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .color-history-swatches {
      display: flex;
      gap: 6px;
    }

    .color-history-swatch {
      width: 32px;
      height: 32px;
      border: 2px solid var(--divider-color);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0;
      flex-shrink: 0;
    }

    .color-history-swatch:hover {
      transform: scale(1.1);
      border-color: var(--primary-color);
    }

    .color-history-swatch:active {
      transform: scale(0.95);
    }
  `,e([pe({type:Array})],ft.prototype,"colorHistory",void 0),e([pe({type:Object})],ft.prototype,"translations",void 0),ft=e([ce("color-history-swatches")],ft);let bt=class extends(mt(re)){constructor(){super(...arguments),this.mode="selection",this.maxSegments=10,this.value="",this.colorValue=new Map,this.colorPalette=[...Ye],this.gradientColors=[...Xe],this.blockColors=[...Ke],this.expandBlocks=!1,this.gradientMirror=!1,this.gradientRepeat=1,this.gradientReverse=!1,this.gradientInterpolation="shortest",this.gradientWave=!1,this.gradientWaveCycles=1,this.label="",this.description="",this.disabled=!1,this.translations={},this.colorHistory=[],this.zones=[],this.turnOffUnspecified=!0,this.hideControls=!1,this._reorderLayout="grid",this._steps=[],this._colorIdCounter=0,this._stepsSource=null,this._suppressSync=!1,this._selectedSegments=new Set,this._coloredSegments=new Map,this._lastSelectedIndex=null,this._selectedPaletteIndex=0,this._selectedZone="",this._clearMode=!1,this._selectMode=!1,this._patternMode="individual",this._initialPatternApplied=!1,this._editingColorSource=null,this._editingColorIndex=null,this._editingColor=null,this._hsColorCache=new Map,this._wheelIsDragging=!1,this._wheelCanvasId=null,this._wheelMarkerId=null,this._wheelSize=0,this._wheelPointerMoveBound=null,this._wheelPointerUpBound=null}_generateColorId(){return`color-${++this._colorIdCounter}-${Date.now()}`}_toColors(e){return e.map(e=>({x:e.x,y:e.y,id:this._generateColorId()}))}_syncSteps(){"gradient"===this._patternMode?(this._steps=this._toColors(this.gradientColors),this._stepsSource="gradient"):"blocks"===this._patternMode?(this._steps=this._toColors(this.blockColors),this._stepsSource="blocks"):(this._steps=[],this._stepsSource=null)}static get styles(){return[vt,n`
      :host {
        display: block;
      }

      .segment-selector {
        width: 100%;
      }

      .label {
        display: block;
        font-weight: 500;
        margin-bottom: 8px;
        color: var(--primary-text-color);
      }

      .segment-grid-container {
        background: var(--card-background-color);
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 8px;
      }

      .segment-grid-container.compact {
        padding: 8px;
        margin-bottom: 0;
      }

      .segment-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(36px, 1fr));
        gap: 4px;
        margin-bottom: 12px;
      }

      .compact .segment-grid {
        grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
        gap: 3px;
        margin-bottom: 0;
      }

      .segment-cell {
        aspect-ratio: 1;
        border-radius: 4px;
        cursor: pointer;
        border: 2px solid var(--divider-color);
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: 600;
        color: var(--secondary-text-color);
        background: var(--primary-background-color);
        user-select: none;
      }

      .compact .segment-cell {
        font-size: 9px;
        border-width: 1px;
      }

      .segment-cell:hover {
        transform: scale(1.1);
        z-index: 1;
        border-color: var(--primary-color);
      }

      .segment-cell.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px var(--primary-color);
      }

      .segment-cell.colored {
        border-color: transparent;
        color: transparent;
      }

      .segment-cell.disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }

      /* Clear mode cursor */
      .segment-grid.clear-mode .segment-cell.colored {
        cursor: not-allowed;
      }

      .segment-grid.clear-mode .segment-cell.colored:hover {
        opacity: 0.7;
      }

      /* Select mode cursor */
      .segment-grid.select-mode .segment-cell {
        cursor: crosshair;
      }

      .segment-grid.select-mode .segment-cell:hover {
        border-color: var(--info-color, #2196f3);
      }

      /* Grid toolbar - compact inline controls below segment grid */
      .grid-toolbar {
        display: flex;
        align-items: center;
        gap: 4px;
        padding-top: 8px;
        border-top: 1px solid var(--divider-color);
        margin-top: 8px;
      }

      .grid-toolbar ha-button {
        color: var(--primary-color);
        font-size: var(--ha-font-size-s, 13px);
      }

      .grid-toolbar ha-icon-button {
        --ha-icon-button-size: 36px;
        --mdc-icon-button-size: 36px;
        --mdc-icon-size: 20px;
      }

      /* Fix ha-svg-icon vertical misalignment inside ha-icon-button */
      .grid-toolbar ha-icon-button > ha-icon {
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .toolbar-spacer {
        flex: 1;
      }

      .toolbar-divider {
        width: 1px;
        height: 24px;
        background: var(--divider-color);
        margin: 0 2px;
      }

      .selection-badge {
        font-size: var(--ha-font-size-s, 12px);
        color: var(--secondary-text-color);
        padding: 2px 8px;
        white-space: nowrap;
      }

      /* Mode toggle active states */
      .mode-toggle.active {
        color: var(--primary-color);
      }

      .mode-toggle.eraser.active {
        color: var(--error-color);
      }

      .zone-select {
        min-width: 200px;
      }

      .description {
        display: block;
        font-size: 12px;
        color: var(--secondary-text-color);
        margin-top: 4px;
      }

      .hint {
        display: block;
        font-size: 11px;
        color: var(--secondary-text-color);
        margin-top: 8px;
        font-style: italic;
      }

      /* Color palette styles */
      .color-palette-container {
        margin-top: 8px;
        padding: 16px;
        background: var(--card-background-color);
        border-radius: 8px;
      }

      /* Pattern mode tabs using native HA tab group */
      .pattern-tabs {
        margin-bottom: 12px;
      }

      .pattern-tabs ha-tab-group {
        --track-color: var(--divider-color);
        --indicator-color: var(--primary-color);
      }

      .pattern-tabs ha-tab-group-tab {
        --ha-tab-active-text-color: var(--primary-color);
        font-size: var(--ha-font-size-m, 14px);
      }

      /* Subtle hint text below tabs */
      .mode-hint {
        font-size: var(--ha-font-size-xs, 11px);
        color: var(--secondary-text-color);
        margin-bottom: 12px;
        font-style: italic;
      }

      .color-palette {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
      }

      .palette-label {
        font-size: 13px;
        color: var(--secondary-text-color);
        margin-right: 8px;
      }

      .palette-color-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .palette-color {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        cursor: pointer;
        border: 3px solid var(--divider-color);
        transition: all 0.2s ease;
        position: relative;
      }

      .palette-color:hover {
        transform: scale(1.1);
        border-color: var(--primary-color);
      }

      .palette-color.selected {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px var(--primary-color);
      }

      .palette-edit-btn {
        padding: 4px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .palette-edit-btn:hover {
        background: var(--primary-color);
        color: var(--text-primary-color);
      }

      .palette-edit-btn ha-icon {
        --mdc-icon-size: 16px;
      }

      /* Color array for gradient/blocks modes */
      .color-array {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;
      }

      .color-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .color-swatch {
        width: 48px;
        height: 48px;
        border-radius: 8px;
        cursor: pointer;
        border: 2px solid var(--divider-color);
        transition: all 0.2s ease;
      }

      .color-swatch:hover {
        transform: scale(1.05);
        border-color: var(--primary-color);
      }

      .color-remove {
        padding: 4px;
        background: var(--secondary-background-color);
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
      }

      .color-remove:hover {
        background: var(--error-color);
        color: var(--text-primary-color);
      }

      .color-remove ha-icon {
        --mdc-icon-size: 16px;
      }

      .color-remove-spacer {
        height: 26px;
        visibility: hidden;
      }

      /* Drag handle above color swatch */
      .color-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 20px;
        color: var(--secondary-text-color);
        cursor: grab;
        touch-action: none;
        -webkit-user-select: none;
        user-select: none;
        transition: color 0.2s ease;
      }

      .color-drag-handle:hover {
        color: var(--primary-color);
      }

      .color-drag-handle:active {
        cursor: grabbing;
      }

      .color-drag-handle ha-icon {
        --mdc-icon-size: 18px;
      }

      .color-drag-handle-spacer {
        height: 20px;
      }

      /* Suppress swatch hover effect during drag */
      .color-array.is-dragging .color-swatch:hover {
        transform: none;
      }

      /* Suppress add button during drag */
      .color-array.is-dragging .add-color-btn {
        pointer-events: none;
        opacity: 0.4;
      }

      .add-color-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 4px;
      }

      .add-color-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 48px;
        height: 48px;
        border: 2px dashed var(--divider-color);
        border-radius: 8px;
        cursor: pointer;
        color: var(--secondary-text-color);
        transition: all 0.2s ease;
      }

      .add-color-btn:hover .add-color-icon {
        border-color: var(--primary-color);
        color: var(--primary-color);
        transform: scale(1.05);
      }

      .add-color-icon ha-icon {
        --mdc-icon-size: 24px;
      }

      /* Grid options row (zone dropdown below toolbar) */
      .grid-options {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 8px;
        flex-wrap: wrap;
      }

      .grid-options .zone-select {
        min-width: 200px;
        flex: 1;
        max-width: 300px;
      }

      /* Grouped options section for gradient/blocks settings */
      .options-group {
        margin-top: 12px;
        padding: 12px;
        background: var(--secondary-background-color);
        border-radius: 8px;
      }

      .options-group .options-row:first-child {
        margin-top: 0;
      }

      /* Color section footer (turn off unspecified toggle) */
      .color-footer {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid var(--divider-color);
      }

      .generated-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 16px;
      }

      .options-row {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-top: 12px;
        flex-wrap: wrap;
      }

      .option-item {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .option-label {
        font-size: 13px;
        color: var(--secondary-text-color);
      }

      .option-number-input {
        width: 60px;
        font-size: 13px;
      }

      .option-select {
        font-size: 13px;
      }

      /* Color picker ha-dialog sizing:
       * 8 x 32px swatches + 7 x 6px gaps = 298px content + 48px padding = 346px
       */
      ha-dialog {
        --ha-dialog-width-md: min(346px, calc(100vw - 32px));
        --ha-dialog-max-width: min(346px, calc(100vw - 32px));
      }

      ha-dialog [slot="headerActionItems"] {
        margin-right: 12px;
      }

      ha-dialog [slot="footer"] {
        display: flex;
        gap: 8px;
        justify-content: flex-end;
      }

      .color-picker-modal-preview {
        width: 32px;
        height: 32px;
        border-radius: 6px;
        border: 2px solid var(--divider-color);
      }

      .color-picker-canvas-container {
        display: flex;
        justify-content: center;
        margin: 20px 0;
      }

      .color-picker-rgb-inputs {
        display: flex;
        justify-content: center;
        gap: 12px;
        margin: 16px 0;
      }

      .rgb-input-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
      }

      .rgb-input-channel {
        font-size: 12px;
        font-weight: 500;
        color: var(--secondary-text-color);
        text-transform: uppercase;
      }

      .rgb-input-field {
        width: 60px;
        padding: 6px 8px;
        border: 1px solid var(--divider-color);
        border-radius: 4px;
        background: var(--card-background-color);
        color: var(--primary-text-color);
        font-size: 14px;
        font-family: monospace;
        text-align: center;
      }

      .rgb-input-field:focus {
        outline: none;
        border-color: var(--primary-color);
      }

      @media (max-width: 600px) {
        .segment-grid {
          grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
          gap: 3px;
        }

        .segment-cell {
          font-size: 9px;
        }

        .grid-toolbar {
          flex-wrap: wrap;
        }

        .grid-options .zone-select {
          max-width: 100%;
        }
      }
    `]}disconnectedCallback(){super.disconnectedCallback(),this._wheelPointerMoveBound&&(window.removeEventListener("mousemove",this._wheelPointerMoveBound),window.removeEventListener("touchmove",this._wheelPointerMoveBound),this._wheelPointerMoveBound=null),this._wheelPointerUpBound&&(window.removeEventListener("mouseup",this._wheelPointerUpBound),window.removeEventListener("touchend",this._wheelPointerUpBound),this._wheelPointerUpBound=null)}willUpdate(e){if(super.willUpdate(e),this._suppressSync)return void(this._suppressSync=!1);(e.has("gradientColors")&&"gradient"===this._patternMode||e.has("blockColors")&&"blocks"===this._patternMode)&&this._syncSteps(),this._stepsSource||"gradient"!==this._patternMode&&"blocks"!==this._patternMode||this._syncSteps()}updated(e){!e.has("value")||e.get("value")===this.value||"selection"!==this.mode&&"sequence"!==this.mode||this._parseValue(),!e.has("colorValue")||e.get("colorValue")===this.colorValue||"color"!==this.mode&&"sequence"!==this.mode||this._parseColorValue(),this.initialPatternMode&&!this._initialPatternApplied&&"individual"!==this.initialPatternMode&&this.maxSegments>0&&(this._initialPatternApplied=!0,0===this._coloredSegments.size&&(this._patternMode=this.initialPatternMode,this._applyToGrid())),e.has("maxSegments")&&this._validateSelection()}_parseValue(){const e=new Set;if(!this.value||""===this.value.trim())return void(this._selectedSegments=e);const t=this.value.trim().toLowerCase();if("all"===t){for(let t=0;t<this.maxSegments;t++)e.add(t);return void(this._selectedSegments=e)}const i=t.split(",");for(const t of i){const i=t.trim();if(i)if(i.includes("-")){const t=i.split("-").map(e=>e.trim()),s=t[0]??"",o=t[1]??"",a=parseInt(s,10),n=parseInt(o,10);if(!isNaN(a)&&!isNaN(n)){const t=Math.max(0,a-1),i=Math.min(this.maxSegments-1,n-1);for(let s=t;s<=i;s++)e.add(s)}}else{const t=parseInt(i,10);if(!isNaN(t)){const i=t-1;i>=0&&i<this.maxSegments&&e.add(i)}}}this._selectedSegments=e}_parseColorValue(){this.colorValue instanceof Map?this._coloredSegments=new Map(this.colorValue):this._coloredSegments=new Map}_validateSelection(){const e=new Set;for(const t of this._selectedSegments)t<this.maxSegments&&e.add(t);e.size!==this._selectedSegments.size&&(this._selectedSegments=e,"selection"!==this.mode&&"sequence"!==this.mode||this._fireValueChanged());const t=new Map;for(const[e,i]of this._coloredSegments)e<this.maxSegments&&t.set(e,i);t.size!==this._coloredSegments.size&&(this._coloredSegments=t,"color"!==this.mode&&"sequence"!==this.mode||this._fireColorValueChanged())}_segmentsToString(){if(0===this._selectedSegments.size)return"";if(this._selectedSegments.size===this.maxSegments)return"all";const e=Array.from(this._selectedSegments).sort((e,t)=>e-t),t=[];if(0===e.length)return"";let i=e[0],s=e[0];for(let o=1;o<e.length;o++){const a=e[o];a===s+1?s=a:(t.push(i===s?`${i+1}`:`${i+1}-${s+1}`),i=s=a)}return t.push(i===s?`${i+1}`:`${i+1}-${s+1}`),t.join(",")}_handleSegmentClick(e,t){this.disabled||(t.preventDefault(),"selection"===this.mode?this._handleSelectionClick(e,t):"color"!==this.mode&&"sequence"!==this.mode||this._handleColorClick(e,t))}_handleSelectionClick(e,t){const i=new Set(this._selectedSegments);if(t.shiftKey&&null!==this._lastSelectedIndex){const t=Math.min(this._lastSelectedIndex,e),s=Math.max(this._lastSelectedIndex,e);for(let e=t;e<=s;e++)i.add(e)}else t.ctrlKey||t.metaKey,i.has(e)?i.delete(e):i.add(e);this._lastSelectedIndex=e,this._selectedSegments=i,this._fireValueChanged()}_handleColorClick(e,t){if(this._clearMode){const t=new Map(this._coloredSegments);return t.delete(e),this._coloredSegments=t,void this._fireColorValueChanged()}if(this._selectMode||t.shiftKey){const t=new Set(this._selectedSegments);t.has(e)?t.delete(e):t.add(e),this._selectedSegments=t}else if(t.ctrlKey||t.metaKey)this._selectedSegments=new Set([...this._selectedSegments,e]);else{const t=this.colorPalette[this._selectedPaletteIndex];if(!t)return;const i=new Map(this._coloredSegments);i.set(e,{...t}),this._coloredSegments=i,this._fireColorValueChanged()}}_localize(e,t){return it(this.translations,e,t)}_selectAll(){if(this.disabled)return;const e=new Set;for(let t=0;t<this.maxSegments;t++)e.add(t);this._selectedSegments=e,this._lastSelectedIndex=null,"selection"!==this.mode&&"sequence"!==this.mode||this._fireValueChanged()}_clearAll(){this.disabled||(this._selectedSegments=new Set,this._coloredSegments=new Map,this._lastSelectedIndex=null,"selection"!==this.mode&&"sequence"!==this.mode||this._fireValueChanged(),"color"!==this.mode&&"sequence"!==this.mode||this._fireColorValueChanged())}_getBuiltInZoneIndices(e){const t=Math.floor(this.maxSegments/2);switch(e){case"__all":return Array.from({length:this.maxSegments},(e,t)=>t);case"__first-half":return Array.from({length:t},(e,t)=>t);case"__second-half":return Array.from({length:this.maxSegments-t},(e,i)=>t+i);case"__odd":return Array.from({length:this.maxSegments},(e,t)=>t).filter(e=>e%2==0);case"__even":return Array.from({length:this.maxSegments},(e,t)=>t).filter(e=>e%2==1);default:return null}}get _zoneOptions(){const e=[];if(this.zones.length>0)for(const t of this.zones)e.push({value:t.name,label:t.name});return e.push({value:"__all",label:this._localize("editors.select_all_button")}),e.push({value:"__first-half",label:this._localize("editors.first_half_button")}),e.push({value:"__second-half",label:this._localize("editors.second_half_button")}),e.push({value:"__odd",label:this._localize("editors.odd_button")}),e.push({value:"__even",label:this._localize("editors.even_button")}),e}_handleZoneSelected(e){e.stopPropagation();const t=e.detail.value;if(!t||this.disabled)return;const i=this._getBuiltInZoneIndices(t);let s;if(i)s=new Set(i);else{const e=this.zones.find(e=>e.name===t);if(!e)return;s=new Set(e.segmentIndices)}this._selectedSegments=s,this._lastSelectedIndex=null,"selection"!==this.mode&&"sequence"!==this.mode||this._fireValueChanged(),this._selectedZone=""}_clearSelected(){if(!this.disabled&&0!==this._selectedSegments.size){if("color"===this.mode||"sequence"===this.mode){const e=new Map(this._coloredSegments);for(const t of this._selectedSegments)e.delete(t);this._coloredSegments=e,this._fireColorValueChanged()}this._selectedSegments=new Set}}_toggleClearMode(){this._clearMode=!this._clearMode,this._clearMode&&(this._selectMode=!1)}_toggleSelectMode(){this._selectMode=!this._selectMode,this._selectMode&&(this._clearMode=!1)}_selectPaletteColor(e){this._selectedPaletteIndex=e}_applyToSelected(){if(0===this._selectedSegments.size)return;const e=this.colorPalette[this._selectedPaletteIndex];if(!e)return;const t=new Map(this._coloredSegments);for(const i of this._selectedSegments)t.set(i,{...e});this._coloredSegments=t,this._selectedSegments=new Set,this._fireColorValueChanged()}_setPatternMode(e){this._patternMode=e,this._clearMode=!1,this._selectMode=!1,this._syncSteps()}_reorderStep(e,t){super._reorderStep(e,t),this._suppressSync=!0;const i=this._steps.map(e=>({x:e.x,y:e.y}));"gradient"===this._stepsSource?(this.gradientColors=i,this._fireGradientColorsChanged()):"blocks"===this._stepsSource&&(this.blockColors=i,this._fireBlockColorsChanged())}_addGradientColor(){if(this.gradientColors.length>=6||0===this.gradientColors.length)return;const e=this.gradientColors[this.gradientColors.length-1];if(!e)return;const t=We(e);this.gradientColors=[...this.gradientColors,t],this._fireGradientColorsChanged()}_removeGradientColor(e){this.gradientColors.length<=2||(this.gradientColors=this.gradientColors.filter((t,i)=>i!==e),this._fireGradientColorsChanged())}_addBlockColor(){if(this.blockColors.length>=6||0===this.blockColors.length)return;const e=this.blockColors[this.blockColors.length-1];if(!e)return;const t=We(e);this.blockColors=[...this.blockColors,t],this._fireBlockColorsChanged()}_removeBlockColor(e){this.blockColors.length<=1||(this.blockColors=this.blockColors.filter((t,i)=>i!==e),this._fireBlockColorsChanged())}_handleExpandBlocksChange(e){this.expandBlocks=e.target.checked}_handleGradientReverseChange(e){this.gradientReverse=e.target.checked}_handleGradientMirrorChange(e){this.gradientMirror=e.target.checked}_handleGradientWaveChange(e){this.gradientWave=e.target.checked}_handleGradientRepeatChange(e){this.gradientRepeat=Math.max(1,Math.min(10,parseInt(e.target.value)||1))}_handleGradientWaveCyclesChange(e){this.gradientWaveCycles=Math.max(1,Math.min(5,parseInt(e.target.value)||1))}_handleGradientInterpolationChange(e){e.detail.value&&(this.gradientInterpolation=e.detail.value)}_interpolateHue(e,t,i){let s=t-e;s>180?s-=360:s<-180&&(s+=360);let o=e+s*i;return o<0&&(o+=360),o>=360&&(o-=360),o}_interpolateHueLongest(e,t,i){let s=t-e;s>0&&s<=180?s-=360:s<0&&s>=-180&&(s+=360);let o=e+s*i;return o<0&&(o+=360),o>=360&&(o-=360),o}_interpolateColorPair(e,t,i,s,o){if("rgb"===this.gradientInterpolation){const e=Ue(i.x,i.y,255),t=Ue(s.x,s.y,255);return Re(Math.round(e.r+(t.r-e.r)*o),Math.round(e.g+(t.g-e.g)*o),Math.round(e.b+(t.b-e.b)*o))}const a="longest"===this.gradientInterpolation?this._interpolateHueLongest(e.h,t.h,o):this._interpolateHue(e.h,t.h,o);return Ge({h:Math.round(a),s:Math.round(e.s+(t.s-e.s)*o)})}_applyWaveTransform(e){return.5-.5*Math.cos(e*Math.PI*2*this.gradientWaveCycles)}_generateGradientColorArray(e){if(0===e||this.gradientColors.length<2)return[];const t=this.gradientReverse?[...this.gradientColors].reverse():[...this.gradientColors],i=t.length,s=t.map(e=>je(e)),o=this.gradientMirror?Math.ceil(e/2):e,a=this.gradientRepeat>1?Math.max(2,Math.ceil(o/this.gradientRepeat)):o,n=[];for(let e=0;e<a;e++){let o=a>1?e/(a-1):0;this.gradientWave&&(o=this._applyWaveTransform(o));const r=o*(i-1),l=Math.floor(r),c=r-l,d=Math.min(l,i-1),h=Math.min(l+1,i-1),p=s[d],_=s[h],u=t[d],g=t[h];p&&_&&u&&g&&n.push(this._interpolateColorPair(p,_,u,g,c))}const r=[];for(let e=0;e<o;e++){const t=n[e%a];t&&r.push(t)}if(this.gradientMirror){const t=[...r],i=[...r].reverse();for(let s=e%2!=0&&r.length>1?1:0;s<i.length;s++){const e=i[s];e&&t.push(e)}return t.slice(0,e)}return r}_generateGradientPattern(){if(this.gradientColors.length<2||0===this.maxSegments)return new Map;const e=this._generateGradientColorArray(this.maxSegments),t=new Map;return e.forEach((e,i)=>t.set(i,e)),t}_generateBlocksPattern(){const e=this.blockColors,t=e.length,i=new Map;if(0===t||0===this.maxSegments)return i;if(this.expandBlocks){const s=this.maxSegments/t;for(let o=0;o<this.maxSegments;o++){const a=e[Math.min(Math.floor(o/s),t-1)];i.set(o,{x:a.x,y:a.y})}}else for(let s=0;s<this.maxSegments;s++){const o=e[s%t];i.set(s,{x:o.x,y:o.y})}return i}_applyToGrid(){let e;if("gradient"===this._patternMode)e=this._generateGradientPattern();else{if("blocks"!==this._patternMode)return;e=this._generateBlocksPattern()}this._coloredSegments=e,this._fireColorValueChanged()}_applyToSelectedSegments(){if(0===this._selectedSegments.size)return;const e=Array.from(this._selectedSegments).sort((e,t)=>e-t),t=e.length;let i=[];if("gradient"===this._patternMode)i=this.gradientColors;else{if("blocks"!==this._patternMode)return;i=this.blockColors}const s=i.length,o=new Map(this._coloredSegments);if("gradient"===this._patternMode){const i=this._generateGradientColorArray(t);for(let s=0;s<t;s++){const t=e[s],a=i[s];void 0!==t&&a&&o.set(t,a)}}else if("blocks"===this._patternMode)if(this.expandBlocks){const a=Math.ceil(t/s);for(let n=0;n<t;n++){const t=e[n];if(void 0===t)continue;const r=i[Math.min(Math.floor(n/a),s-1)];r&&o.set(t,{x:r.x,y:r.y})}}else for(let a=0;a<t;a++){const t=e[a];if(void 0===t)continue;const n=i[a%s];n&&o.set(t,{x:n.x,y:n.y})}this._coloredSegments=o,this._selectedSegments=new Set,this._fireColorValueChanged()}_openColorPicker(e,t){let i;if("palette"===e?i=this.colorPalette[t]:"gradient"===e?i=this.gradientColors[t]:"blocks"===e&&(i=this.blockColors[t]),!i)return;this._editingColorSource=e,this._editingColorIndex=t;const s=`${i.x.toFixed(4)},${i.y.toFixed(4)}`,o=this._hsColorCache.get(s);this._editingColor=o||je(i)}_confirmColorPicker(){if(null===this._editingColorIndex||null===this._editingColor||!this._editingColorSource)return void this._closeColorPicker();const e=Ge(this._editingColor),t=ut(this.colorHistory,e);this.dispatchEvent(new CustomEvent("color-history-changed",{detail:{colorHistory:t},bubbles:!0,composed:!0}));const i=`${e.x.toFixed(4)},${e.y.toFixed(4)}`;this._hsColorCache.set(i,{h:this._editingColor.h,s:this._editingColor.s}),"palette"===this._editingColorSource?(this.colorPalette=this.colorPalette.map((t,i)=>i===this._editingColorIndex?e:t),this._fireColorPaletteChanged()):"gradient"===this._editingColorSource?(this.gradientColors=this.gradientColors.map((t,i)=>i===this._editingColorIndex?e:t),this._fireGradientColorsChanged()):"blocks"===this._editingColorSource&&(this.blockColors=this.blockColors.map((t,i)=>i===this._editingColorIndex?e:t),this._fireBlockColorsChanged()),this._closeColorPicker()}_closeColorPicker(){this._editingColorSource=null,this._editingColorIndex=null,this._editingColor=null}_handleHistoryColorSelected(e){const t=e.detail.color,i=je(t);this._editingColor={h:i.h,s:i.s};this._updateMarkerPosition("color-wheel-canvas","color-wheel-marker",220);const s=Ue(t.x,t.y,255),o=this.shadowRoot?.querySelectorAll(".color-picker-rgb-inputs .rgb-input-field");o&&3===o.length&&(o[0].value=String(s.r),o[1].value=String(s.g),o[2].value=String(s.b));const a=this.shadowRoot?.querySelector(".color-picker-modal-preview");a&&(a.style.backgroundColor=Fe(s))}_handleRgbInput(e,t){const i=e.target;let s=parseInt(i.value,10);if(isNaN(s)||""===i.value)return;if(s=Math.max(0,Math.min(255,s)),!this._editingColor)return;const o=Ge(this._editingColor),a=Ue(o.x,o.y,255),n={r:"r"===t?s:a.r,g:"g"===t?s:a.g,b:"b"===t?s:a.b},r=Re(n.r,n.g,n.b),l=je(r);this._editingColor={h:l.h,s:l.s};this._updateMarkerPosition("color-wheel-canvas","color-wheel-marker",220);const c=this.shadowRoot?.querySelector(".color-picker-modal-preview");if(c){const e=Fe(Ue(r.x,r.y,255));c.style.backgroundColor=e}const d=this.shadowRoot?.querySelectorAll(".rgb-input-field");if(d&&3===d.length){const e=Ue(r.x,r.y,255),i="r"===t?0:"g"===t?1:2,o=d[0],a=d[1],n=d[2];o&&(o.value=String(e.r)),a&&(a.value=String(e.g)),n&&(n.value=String(e.b));if(("r"===t?e.r:"g"===t?e.g:e.b)!==s){const e=d[i];if(e){const t=e.style.borderColor;e.style.borderColor="var(--warning-color, #ff9800)",setTimeout(()=>{e.style.borderColor=t},500)}}}}_fireValueChanged(){const e=this._segmentsToString();this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}_fireColorValueChanged(){this.dispatchEvent(new CustomEvent("color-value-changed",{detail:{value:this._coloredSegments,segments:this._segmentsToString()},bubbles:!0,composed:!0}))}_fireColorPaletteChanged(){this.dispatchEvent(new CustomEvent("color-palette-changed",{detail:{colors:this.colorPalette},bubbles:!0,composed:!0}))}_fireGradientColorsChanged(){this.dispatchEvent(new CustomEvent("gradient-colors-changed",{detail:{colors:this.gradientColors},bubbles:!0,composed:!0}))}_handleTurnOffUnspecifiedChange(e){this.turnOffUnspecified=e.target.checked,this.dispatchEvent(new CustomEvent("turn-off-unspecified-changed",{detail:{value:this.turnOffUnspecified},bubbles:!0,composed:!0}))}_fireBlockColorsChanged(){this.dispatchEvent(new CustomEvent("block-colors-changed",{detail:{colors:this.blockColors},bubbles:!0,composed:!0}))}_renderGrid(){const e=[];for(let t=0;t<this.maxSegments;t++){const i=this._selectedSegments.has(t),s=this._coloredSegments.get(t),o=void 0!==s,a=[];i&&a.push("selected"),!o||"color"!==this.mode&&"sequence"!==this.mode||a.push("colored"),this.disabled&&a.push("disabled");const n=!o||"color"!==this.mode&&"sequence"!==this.mode?"":`background-color: ${Le(s)}`;e.push(N`
        <div
          class="segment-cell ${a.join(" ")}"
          role="button"
          tabindex="0"
          style="${n}"
          @click=${e=>this._handleSegmentClick(t,e)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._handleSegmentClick(t,e))}}
          title="Segment ${t+1}${i?" (selected)":""}${o?" (colored)":""}"
          aria-label="Segment ${t+1}"
          aria-pressed="${i?"true":"false"}"
        >
          ${t+1}
        </div>
      `)}return N`
      <div class="segment-grid-container ${this.hideControls?"compact":""}">
        <div
          class="segment-grid ${this._clearMode?"clear-mode":""} ${this._selectMode?"select-mode":""}"
          role="group"
          aria-label="${this._localize("editors.segment_grid_label")||"Segment grid"}"
        >
          ${e}
        </div>
        ${this.hideControls?"":this._renderControls()}
      </div>
    `}_renderControls(){const e=this._selectedSegments.size,t=e>0;return"selection"===this.mode?N`
        <div class="grid-toolbar">
          <ha-button @click=${this._selectAll} .disabled=${this.disabled}>
            ${this._localize("editors.select_all_button")}
          </ha-button>
          <ha-button @click=${this._clearAll} .disabled=${this.disabled||!t}>
            ${this._localize("editors.clear_all_button")}
          </ha-button>
          <div class="toolbar-spacer"></div>
          <span class="selection-badge">
            ${this._localize("editors.segments_selected",{count:e})}
          </span>
        </div>
        <div class="grid-options">
          <ha-selector
            class="zone-select"
            .hass=${this.hass}
            .selector=${{select:{options:this._zoneOptions,mode:"dropdown"}}}
            .label=${this._localize("editors.zone_select_label")}
            .value=${this._selectedZone}
            .disabled=${this.disabled}
            @value-changed=${this._handleZoneSelected}
          ></ha-selector>
        </div>
      `:"color"===this.mode||"sequence"===this.mode?N`
        <div class="grid-toolbar">
          <ha-button @click=${this._selectAll} .disabled=${this.disabled}>
            ${this._localize("editors.select_all_button")}
          </ha-button>
          <ha-button @click=${this._clearSelected} .disabled=${this.disabled||!t}>
            ${this._localize("editors.clear_selected_button")}
          </ha-button>
          <ha-button @click=${this._clearAll} .disabled=${this.disabled}>
            ${this._localize("editors.clear_all_button")}
          </ha-button>
          <div class="toolbar-spacer"></div>
          <ha-icon-button
            class="mode-toggle ${this._selectMode?"active":""}"
            @click=${this._toggleSelectMode}
            .disabled=${this.disabled}
            title="${this._selectMode?this._localize("editors.select_mode_on"):this._localize("editors.select_mode_off")}"
          >
            <ha-icon icon="${this._selectMode?"mdi:selection-multiple":"mdi:selection"}"></ha-icon>
          </ha-icon-button>
          <ha-icon-button
            class="mode-toggle eraser ${this._clearMode?"active":""}"
            @click=${this._toggleClearMode}
            .disabled=${this.disabled}
            title="${this._clearMode?this._localize("editors.clear_mode_on"):this._localize("editors.clear_mode_off")}"
          >
            <ha-icon icon="${this._clearMode?"mdi:eraser":"mdi:eraser-variant"}"></ha-icon>
          </ha-icon-button>
          <div class="toolbar-divider"></div>
          <span class="selection-badge">
            ${this._localize("editors.segments_selected",{count:e})}
          </span>
        </div>
        <div class="grid-options">
          <ha-selector
            class="zone-select"
            .hass=${this.hass}
            .selector=${{select:{options:this._zoneOptions,mode:"dropdown"}}}
            .label=${this._localize("editors.zone_select_label")}
            .value=${this._selectedZone}
            .disabled=${this.disabled}
            @value-changed=${this._handleZoneSelected}
          ></ha-selector>
        </div>
      `:""}_renderColorPalette(){return"color"!==this.mode&&"sequence"!==this.mode?"":N`
      <div class="color-palette-container">
        ${"color"===this.mode?this._renderModeTabs():""}
        ${this._renderModeContent()}
        ${this._renderColorFooter()}
      </div>
    `}_renderColorFooter(){return"color"!==this.mode&&"sequence"!==this.mode?"":N`
      <div class="color-footer">
        <label class="option-item">
          <ha-switch
            .checked=${this.turnOffUnspecified}
            @change=${this._handleTurnOffUnspecifiedChange}
          ></ha-switch>
          <span class="option-label">${this._localize("editors.turn_off_unspecified_label")}</span>
        </label>
      </div>
    `}_renderModeTabs(){return N`
      <div class="pattern-tabs">
        <ha-tab-group @wa-tab-show=${this._handlePatternModeChange}>
          <ha-tab-group-tab
            slot="nav"
            panel="individual"
            .active=${"individual"===this._patternMode}
          >
            ${this._localize("editors.individual_tab")}
          </ha-tab-group-tab>
          <ha-tab-group-tab
            slot="nav"
            panel="gradient"
            .active=${"gradient"===this._patternMode}
          >
            ${this._localize("editors.gradient_tab")}
          </ha-tab-group-tab>
          <ha-tab-group-tab
            slot="nav"
            panel="blocks"
            .active=${"blocks"===this._patternMode}
          >
            ${this._localize("editors.blocks_tab")}
          </ha-tab-group-tab>
        </ha-tab-group>
      </div>
    `}_handlePatternModeChange(e){const t=e.detail.name;t&&t!==this._patternMode&&this._setPatternMode(t)}_renderModeContent(){return"sequence"===this.mode||"individual"===this._patternMode?this._renderIndividualMode():"gradient"===this._patternMode?this._renderGradientMode():"blocks"===this._patternMode?this._renderBlocksMode():N``}_renderIndividualMode(){return N`
      <div class="mode-hint">
        Click a color to select it, then click segments to apply.
      </div>
      <div class="color-palette">
        ${this.colorPalette.map((e,t)=>N`
          <div class="palette-color-wrapper">
            <div
              class="palette-color ${this._selectedPaletteIndex===t?"selected":""}"
              role="button"
              tabindex="0"
              style="background-color: ${Le(e)}"
              @click=${()=>this._selectPaletteColor(t)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._selectPaletteColor(t))}}
              aria-label="${this._localize("editors.color_label")||"Color"} ${t+1}: ${Le(e)}"
              aria-pressed="${this._selectedPaletteIndex===t?"true":"false"}"
            ></div>
            <button
              class="palette-edit-btn"
              @click=${()=>this._openColorPicker("palette",t)}
            >
              <ha-icon icon="mdi:pencil"></ha-icon>
            </button>
          </div>
        `)}
      </div>
      <div class="generated-actions">
        <ha-button
          @click=${this._applyToSelected}
          .disabled=${0===this._selectedSegments.size}
        >
          <ha-icon icon="mdi:selection"></ha-icon>
          ${this._localize("editors.apply_to_selected_button")}
        </ha-button>
      </div>
    `}_renderGradientMode(){return N`
      <div class="mode-hint">
        ${this._localize("editors.gradient_mode_description")}
      </div>
      <div class="color-array step-list" style="position: relative;">
        ${this._renderGridDropIndicator()}
        ${this._steps.map((e,t)=>N`
          <div class="color-item step-item ${this._dragState.draggingIndex===t?"dragging":""}">
            <div
              class="color-drag-handle"
              role="button"
              aria-label="Reorder color ${t+1}"
              @pointerdown=${e=>this._onDragHandlePointerDown(e,t)}
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <div
              class="color-swatch"
              role="button"
              tabindex="0"
              style="background-color: ${Le(e)}"
              @click=${()=>this._openColorPicker("gradient",t)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._openColorPicker("gradient",t))}}
              aria-label="${this._localize("editors.color_label")||"Color"} ${t+1}: ${Le(e)}"
            ></div>
            ${this.gradientColors.length>2?N`
              <button class="color-remove" @click=${()=>this._removeGradientColor(t)}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            `:N`<div class="color-remove-spacer"></div>`}
          </div>
        `)}
        ${this.gradientColors.length<6?N`
          <div class="add-color-btn">
            <div class="color-drag-handle-spacer"></div>
            <div class="add-color-icon" @click=${this._addGradientColor}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </div>
            <div class="color-remove-spacer"></div>
          </div>
        `:""}
      </div>
      <div class="options-group">
        <div class="options-row">
          <label class="option-item">
            <ha-switch
              .checked=${this.gradientReverse}
              @change=${this._handleGradientReverseChange}
            ></ha-switch>
            <span class="option-label">${this._localize("editors.gradient_reverse_label")}</span>
          </label>
          <label class="option-item">
            <ha-switch
              .checked=${this.gradientMirror}
              @change=${this._handleGradientMirrorChange}
            ></ha-switch>
            <span class="option-label">${this._localize("editors.gradient_mirror_label")}</span>
          </label>
          <label class="option-item">
            <ha-switch
              .checked=${this.gradientWave}
              @change=${this._handleGradientWaveChange}
            ></ha-switch>
            <span class="option-label">${this._localize("editors.gradient_wave_label")}</span>
          </label>
        </div>
        <div class="options-row">
          <label class="option-item">
            ${Qe({type:"number",className:"option-number-input",min:"1",max:"10",value:String(this.gradientRepeat),onChange:this._handleGradientRepeatChange})}
            <span class="option-label">${this._localize("editors.gradient_repeat_label")}</span>
          </label>
          <label class="option-item">
            <ha-selector
              class="option-select"
              .hass=${this.hass}
              .selector=${{select:{options:[{value:"shortest",label:this._localize("editors.gradient_interp_shortest")},{value:"longest",label:this._localize("editors.gradient_interp_longest")},{value:"rgb",label:this._localize("editors.gradient_interp_rgb")}],mode:"dropdown"}}}
              .value=${this.gradientInterpolation}
              @value-changed=${this._handleGradientInterpolationChange}
            ></ha-selector>
            <span class="option-label">${this._localize("editors.gradient_interpolation_label")}</span>
          </label>
          ${this.gradientWave?N`
            <label class="option-item">
              ${Qe({type:"number",className:"option-number-input",min:"1",max:"5",value:String(this.gradientWaveCycles),onChange:this._handleGradientWaveCyclesChange})}
              <span class="option-label">${this._localize("editors.gradient_wave_cycles_label")}</span>
            </label>
          `:""}
        </div>
      </div>
      <div class="generated-actions">
        <ha-button @click=${this._applyToGrid}>
          <ha-icon icon="mdi:grid"></ha-icon>
          ${this._localize("editors.apply_to_grid_button")}
        </ha-button>
        <ha-button
          @click=${this._applyToSelectedSegments}
          .disabled=${0===this._selectedSegments.size}
        >
          <ha-icon icon="mdi:selection"></ha-icon>
          ${this._localize("editors.apply_to_selected_button")}
        </ha-button>
      </div>
    `}_renderBlocksMode(){return N`
      <div class="mode-hint">
        ${this._localize("editors.blocks_mode_description")}
      </div>
      <div class="color-array step-list" style="position: relative;">
        ${this._renderGridDropIndicator()}
        ${this._steps.map((e,t)=>N`
          <div class="color-item step-item ${this._dragState.draggingIndex===t?"dragging":""}">
            <div
              class="color-drag-handle"
              role="button"
              aria-label="Reorder color ${t+1}"
              @pointerdown=${e=>this._onDragHandlePointerDown(e,t)}
            >
              <ha-icon icon="mdi:drag"></ha-icon>
            </div>
            <div
              class="color-swatch"
              role="button"
              tabindex="0"
              style="background-color: ${Le(e)}"
              @click=${()=>this._openColorPicker("blocks",t)}
              @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._openColorPicker("blocks",t))}}
              aria-label="${this._localize("editors.color_label")||"Color"} ${t+1}: ${Le(e)}"
            ></div>
            ${this.blockColors.length>1?N`
              <button class="color-remove" @click=${()=>this._removeBlockColor(t)}>
                <ha-icon icon="mdi:close"></ha-icon>
              </button>
            `:N`<div class="color-remove-spacer"></div>`}
          </div>
        `)}
        ${this.blockColors.length<6?N`
          <div class="add-color-btn">
            <div class="color-drag-handle-spacer"></div>
            <div class="add-color-icon" @click=${this._addBlockColor}>
              <ha-icon icon="mdi:plus"></ha-icon>
            </div>
            <div class="color-remove-spacer"></div>
          </div>
        `:""}
      </div>
      <div class="options-group">
        <div class="options-row">
          <label class="option-item">
            <ha-switch
              .checked=${this.expandBlocks}
              @change=${this._handleExpandBlocksChange}
            ></ha-switch>
            <span class="option-label">${this._localize("editors.expand_blocks_label")}</span>
          </label>
        </div>
      </div>
      <div class="generated-actions">
        <ha-button @click=${this._applyToGrid}>
          <ha-icon icon="mdi:grid"></ha-icon>
          ${this._localize("editors.apply_to_grid_button")}
        </ha-button>
        <ha-button
          @click=${this._applyToSelectedSegments}
          .disabled=${0===this._selectedSegments.size}
        >
          <ha-icon icon="mdi:selection"></ha-icon>
          ${this._localize("editors.apply_to_selected_button")}
        </ha-button>
      </div>
    `}_renderColorPickerModal(){if(null===this._editingColorSource||null===this._editingColor)return"";const e=Ge(this._editingColor),t=Ue(e.x,e.y,255),i=Fe(t);return N`
      <ha-dialog
        open
        @closed=${this._closeColorPicker}
        .headerTitle=${this._localize("editors.color_picker_title")}
      >
        <span slot="headerNavigationIcon"></span>
        <div
          slot="headerActionItems"
          class="color-picker-modal-preview"
          style="background-color: ${i}"
        ></div>
        <div class="color-picker-canvas-container">
          ${this._renderColorWheel()}
        </div>
        <div class="color-picker-rgb-inputs">
          <label class="rgb-input-label">
            <span class="rgb-input-channel">R</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${String(t.r)}
              @input=${e=>this._handleRgbInput(e,"r")}
            />
          </label>
          <label class="rgb-input-label">
            <span class="rgb-input-channel">G</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${String(t.g)}
              @input=${e=>this._handleRgbInput(e,"g")}
            />
          </label>
          <label class="rgb-input-label">
            <span class="rgb-input-channel">B</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${String(t.b)}
              @input=${e=>this._handleRgbInput(e,"b")}
            />
          </label>
        </div>
        <color-history-swatches
          .colorHistory=${this.colorHistory}
          .translations=${this.translations}
          @color-selected=${this._handleHistoryColorSelected}
        ></color-history-swatches>
        ${Je(this._localize("editors.cancel_button"),this._localize("editors.apply_button"),()=>this._closeColorPicker(),()=>this._confirmColorPicker(),"mdi:check")}
      </ha-dialog>
    `}_renderColorWheel(){const e=220,t="color-wheel-canvas",i="color-wheel-marker";if(!this._editingColor)return N``;const s=Ge(this._editingColor),o=Fe(Ue(s.x,s.y,255)),{x:a,y:n}=this._hsToWheelPosition(this._editingColor,e);return setTimeout(()=>{this._drawColorWheel(t,e),this._wheelIsDragging||this._updateMarkerPosition(t,i,e)},0),N`
      <div class="hs-color-picker-container" style="width: ${e}px; height: ${e}px; position: relative; margin: 0 auto; touch-action: none;">
        <canvas
          id="${t}"
          width="${e}"
          height="${e}"
          style="border-radius: 50%; cursor: crosshair; display: block;"
          @mousedown=${s=>this._onWheelPointerDown(s,t,i,e)}
          @touchstart=${s=>this._onWheelPointerDown(s,t,i,e)}
        ></canvas>
        <div
          id="${i}"
          style="position: absolute; left: ${a}px; top: ${n}px; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.3); pointer-events: none; transform: translate(-50%, -50%); transition: box-shadow 0.1s ease; background-color: ${o};"
        ></div>
      </div>
    `}_drawColorWheel(e,t){const i=this.shadowRoot?.getElementById(e);if(!i)return;const s=i.getContext("2d");if(!s)return;const o=t/2,a=t/2,n=t/2;i.width=t,i.height=t;for(let e=0;e<360;e++){const t=(e-1)*Math.PI/180,i=(e+1)*Math.PI/180,r=s.createRadialGradient(o,a,0,o,a,n);r.addColorStop(0,`hsl(${e}, 0%, 100%)`),r.addColorStop(1,`hsl(${e}, 100%, 50%)`),s.beginPath(),s.moveTo(o,a),s.arc(o,a,n,t,i),s.closePath(),s.fillStyle=r,s.fill()}}_updateMarkerPosition(e,t,i){const s=this.shadowRoot?.getElementById(t);if(!s||!this._editingColor)return;const{x:o,y:a}=this._hsToWheelPosition(this._editingColor,i),n=Ge(this._editingColor),r=Fe(Ue(n.x,n.y,255));s.style.left=`${o}px`,s.style.top=`${a}px`,s.style.backgroundColor=r}_hsToWheelPosition(e,t){const i=t/2,s=t/2,o=t/2,a=e.h*Math.PI/180,n=e.s/100*o;return{x:i+n*Math.cos(a),y:s+n*Math.sin(a)}}_wheelPositionToHs(e,t,i){const s=i/2,o=e-i/2,a=t-i/2;let n=Math.sqrt(o*o+a*a);n=Math.min(n,s);let r=180*Math.atan2(a,o)/Math.PI;r<0&&(r+=360);let l=Math.round(n/s*100);return l>=98&&(l=100),{h:Math.round(r)%360,s:l}}_onWheelPointerDown(e,t,i,s){e.preventDefault(),this._wheelIsDragging=!0,this._wheelCanvasId=t,this._wheelMarkerId=i,this._wheelSize=s;const o=this.shadowRoot?.getElementById(i);o&&(o.style.boxShadow="0 0 8px rgba(0, 0, 0, 0.7), inset 0 0 2px rgba(0, 0, 0, 0.3)"),this._handleWheelInteraction(e,t,i,s),e instanceof MouseEvent?(this._wheelPointerMoveBound=e=>this._onWheelPointerMove(e),this._wheelPointerUpBound=()=>this._onWheelPointerUp(),window.addEventListener("mousemove",this._wheelPointerMoveBound),window.addEventListener("mouseup",this._wheelPointerUpBound)):(this._wheelPointerMoveBound=e=>this._onWheelPointerMove(e),this._wheelPointerUpBound=()=>this._onWheelPointerUp(),window.addEventListener("touchmove",this._wheelPointerMoveBound,{passive:!1}),window.addEventListener("touchend",this._wheelPointerUpBound))}_onWheelPointerMove(e){this._wheelIsDragging&&this._wheelCanvasId&&this._wheelMarkerId&&(e.preventDefault(),this._handleWheelInteraction(e,this._wheelCanvasId,this._wheelMarkerId,this._wheelSize))}_onWheelPointerUp(){this._wheelIsDragging=!1;const e=this._wheelMarkerId?this.shadowRoot?.getElementById(this._wheelMarkerId):null;e&&(e.style.boxShadow="0 0 4px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.3)"),this._wheelPointerMoveBound&&(window.removeEventListener("mousemove",this._wheelPointerMoveBound),window.removeEventListener("touchmove",this._wheelPointerMoveBound),this._wheelPointerMoveBound=null),this._wheelPointerUpBound&&(window.removeEventListener("mouseup",this._wheelPointerUpBound),window.removeEventListener("touchend",this._wheelPointerUpBound),this._wheelPointerUpBound=null)}_handleWheelInteraction(e,t,i,s){const o=this.shadowRoot?.getElementById(t);if(!o)return;const a=o.getBoundingClientRect();let n,r;if("touches"in e){const t=e.touches[0];if(!t)return;n=t.clientX,r=t.clientY}else n=e.clientX,r=e.clientY;const l=n-a.left,c=r-a.top,d=this._wheelPositionToHs(l,c,s);this._editingColor=d,this._updateMarkerPosition(t,i,s);const h=this.shadowRoot?.querySelector(".color-picker-modal-preview");if(h){const e=Ge(this._editingColor),t=Fe(Ue(e.x,e.y,255));h.style.backgroundColor=t}const p=this.shadowRoot?.querySelectorAll(".rgb-input-field");if(p&&3===p.length){const e=Ge(this._editingColor),t=Ue(e.x,e.y,255),i=p[0],s=p[1],o=p[2];i&&(i.value=String(t.r)),s&&(s.value=String(t.g)),o&&(o.value=String(t.b))}}render(){return N`
      <div class="segment-selector">
        ${this.label?N`<span class="label">${this.label}</span>`:""}
        ${this._renderGrid()}
        ${this._renderColorPalette()}
        ${this.description?N`<span class="description">${this.description}</span>`:""}
        ${this._renderColorPickerModal()}
      </div>
    `}};e([pe({type:Object})],bt.prototype,"hass",void 0),e([pe({type:String})],bt.prototype,"mode",void 0),e([pe({type:Number})],bt.prototype,"maxSegments",void 0),e([pe({type:String})],bt.prototype,"value",void 0),e([pe({type:Object})],bt.prototype,"colorValue",void 0),e([pe({type:Array})],bt.prototype,"colorPalette",void 0),e([pe({type:Array})],bt.prototype,"gradientColors",void 0),e([pe({type:Array})],bt.prototype,"blockColors",void 0),e([pe({type:Boolean})],bt.prototype,"expandBlocks",void 0),e([pe({type:Boolean})],bt.prototype,"gradientMirror",void 0),e([pe({type:Number})],bt.prototype,"gradientRepeat",void 0),e([pe({type:Boolean})],bt.prototype,"gradientReverse",void 0),e([pe({type:String})],bt.prototype,"gradientInterpolation",void 0),e([pe({type:Boolean})],bt.prototype,"gradientWave",void 0),e([pe({type:Number})],bt.prototype,"gradientWaveCycles",void 0),e([pe({type:String})],bt.prototype,"label",void 0),e([pe({type:String})],bt.prototype,"description",void 0),e([pe({type:Boolean})],bt.prototype,"disabled",void 0),e([pe({type:Object})],bt.prototype,"translations",void 0),e([pe({type:Array})],bt.prototype,"colorHistory",void 0),e([pe({type:String})],bt.prototype,"initialPatternMode",void 0),e([pe({type:Array})],bt.prototype,"zones",void 0),e([pe({type:Boolean})],bt.prototype,"turnOffUnspecified",void 0),e([pe({type:Boolean})],bt.prototype,"hideControls",void 0),e([_e()],bt.prototype,"_steps",void 0),e([_e()],bt.prototype,"_selectedSegments",void 0),e([_e()],bt.prototype,"_coloredSegments",void 0),e([_e()],bt.prototype,"_lastSelectedIndex",void 0),e([_e()],bt.prototype,"_selectedPaletteIndex",void 0),e([_e()],bt.prototype,"_selectedZone",void 0),e([_e()],bt.prototype,"_clearMode",void 0),e([_e()],bt.prototype,"_selectMode",void 0),e([_e()],bt.prototype,"_patternMode",void 0),e([_e()],bt.prototype,"_editingColorSource",void 0),e([_e()],bt.prototype,"_editingColorIndex",void 0),e([_e()],bt.prototype,"_editingColor",void 0),bt=e([ce("segment-selector")],bt);let yt=class extends re{constructor(){super(...arguments),this.curvature=1,this.width=300,this.height=300,this._isDragging=!1,this.MIN_CURVATURE=.2,this.MAX_CURVATURE=6,this.STEP=.01,this._themeColors=null,this._handleCanvasPointerMove=e=>{this._isDragging&&(e.preventDefault(),this._handleCanvasInteraction(e))},this._handleCanvasPointerUp=()=>{this._isDragging=!1,window.removeEventListener("mousemove",this._handleCanvasPointerMove),window.removeEventListener("mouseup",this._handleCanvasPointerUp),window.removeEventListener("touchmove",this._handleCanvasPointerMove),window.removeEventListener("touchend",this._handleCanvasPointerUp)}}firstUpdated(){this._drawCurve()}updated(e){e.has("curvature")&&this._canvas&&this._drawCurve()}_getControlPoint(){const e=this.curvature;let t;t=e<=1?(e-this.MIN_CURVATURE)/(1-this.MIN_CURVATURE)*.5:.5+(e-1)/(this.MAX_CURVATURE-1)*.5;return{cx:.05+.9*t,cy:.95-.9*t}}_bezierY(e,t){return 2*(1-e)*e*t+e*e}_bezierX(e,t){return 2*(1-e)*e*t+e*e}_getCurveColor(){if(!this._themeColors){const e=getComputedStyle(this);this._themeColors={warning:e.getPropertyValue("--warning-color").trim()||"#ffc107",primary:e.getPropertyValue("--primary-color").trim()||"#03a9f4",success:e.getPropertyValue("--success-color").trim()||"#4caf50"}}return this.curvature<.95?this._themeColors.warning:this.curvature>1.05?this._themeColors.primary:this._themeColors.success}_drawCurve(){const e=this._canvas;if(!e)return;const t=e.getContext("2d");if(!t)return;const{width:i,height:s}=this,o=24,a=i-48,n=s-48;e.width=i,e.height=s,t.clearRect(0,0,i,s),this._drawGrid(t,o,a,n);const{cx:r,cy:l}=this._getControlPoint(),c=this._getCurveColor(),d=c.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i),h=d?parseInt(d[1],16):3,p=d?parseInt(d[2],16):169,_=d?parseInt(d[3],16):244;t.beginPath(),t.moveTo(o,s-o);const u=100;for(let e=0;e<=u;e++){const i=e/u,c=o+this._bezierX(i,r)*a,d=s-o-this._bezierY(i,l)*n;t.lineTo(c,d)}t.lineTo(o+a,s-o),t.closePath();const g=t.createLinearGradient(0,o,0,s-o);g.addColorStop(0,`rgba(${h}, ${p}, ${_}, 0.15)`),g.addColorStop(1,`rgba(${h}, ${p}, ${_}, 0.02)`),t.fillStyle=g,t.fill(),t.beginPath();for(let e=0;e<=u;e++){const i=e/u,c=o+this._bezierX(i,r)*a,d=s-o-this._bezierY(i,l)*n;0===e?t.moveTo(c,d):t.lineTo(c,d)}t.strokeStyle=c,t.lineWidth=3,t.lineCap="round",t.lineJoin="round",t.stroke();const v=s-o-n;t.beginPath(),t.arc(o+a,v,6,0,2*Math.PI),t.fillStyle=c,t.fill(),t.strokeStyle="white",t.lineWidth=2,t.stroke()}_drawGrid(e,t,i,s){const o=getComputedStyle(this).getPropertyValue("--secondary-text-color").trim()||"rgba(128, 128, 128, 0.5)";e.strokeStyle=o,e.globalAlpha=.3,e.lineWidth=1,e.setLineDash([4,4]);for(let o=0;o<=3;o++){const a=t+i/3*o;e.beginPath(),e.moveTo(a,t),e.lineTo(a,t+s),e.stroke()}for(let o=0;o<=3;o++){const a=t+s/3*o;e.beginPath(),e.moveTo(t,a),e.lineTo(t+i,a),e.stroke()}e.globalAlpha=1,e.setLineDash([])}_handleCanvasPointerDown(e){e.preventDefault(),this._isDragging=!0,this._handleCanvasInteraction(e),e instanceof MouseEvent?(window.addEventListener("mousemove",this._handleCanvasPointerMove),window.addEventListener("mouseup",this._handleCanvasPointerUp)):(window.addEventListener("touchmove",this._handleCanvasPointerMove,{passive:!1}),window.addEventListener("touchend",this._handleCanvasPointerUp))}_handleCanvasInteraction(e){const t=this._canvas;if(!t)return;const i=t.getBoundingClientRect();let s;if("touches"in e){const t=e.touches[0];if(!t)return;s=t.clientY}else s=e.clientY;const o=this.height-48,a=s-i.top-24,n=1-Math.max(0,Math.min(1,a/o));let r;if(n>=.5){r=1-2*(n-.5)*(1-this.MIN_CURVATURE)}else{r=1+2*(.5-n)*(this.MAX_CURVATURE-1)}r=Math.round(r/this.STEP)*this.STEP,r=Math.max(this.MIN_CURVATURE,Math.min(this.MAX_CURVATURE,r));const l=parseFloat(r.toFixed(2));this.dispatchEvent(new CustomEvent("curvature-input",{detail:{curvature:l},bubbles:!0,composed:!0}))}render(){return N`
      <div class="curve-editor-container">
        <div class="curve-header">
          <span class="title">${this.hass.localize("component.aqara_advanced_lighting.panel.transition_curve.title")}</span>
          <span class="subtitle">${this.hass.localize("component.aqara_advanced_lighting.panel.transition_curve.subtitle")}</span>
        </div>

        <div class="curve-canvas-wrapper">
          <div class="graph-container">
            <div class="graph-row">
              <div class="y-axis-label">
                <ha-icon icon="mdi:brightness-6"></ha-icon>
              </div>
              <canvas
                width="${this.width}"
                height="${this.height}"
                @mousedown=${this._handleCanvasPointerDown}
                @touchstart=${this._handleCanvasPointerDown}
              ></canvas>
              <div class="graph-spacer"></div>
            </div>
            <div class="x-axis-label">
              <ha-icon icon="mdi:clock-outline"></ha-icon>
            </div>
          </div>
        </div>
      </div>
    `}};yt.styles=n`
    :host {
      display: block;
    }

    .curve-editor-container {
      background: var(--card-background-color);
      overflow: hidden;
    }

    .curve-header {
      padding: 12px 8px 8px;
    }

    .curve-header .title {
      font-size: var(--ha-font-size-l, 16px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--primary-text-color);
      display: block;
      margin-bottom: 4px;
    }

    .curve-header .subtitle {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }

    .curve-canvas-wrapper {
      position: relative;
      padding: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .graph-container {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .graph-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .y-axis-label {
      display: flex;
      align-items: center;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }

    .graph-spacer {
      width: 20px;
      flex-shrink: 0;
    }

    .x-axis-label {
      display: flex;
      justify-content: center;
      padding-top: 8px;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
      width: 100%;
    }

    canvas {
      display: block;
      cursor: ns-resize;
      border-radius: 8px;
      background: var(--card-background-color);
    }
  `,e([pe({attribute:!1})],yt.prototype,"hass",void 0),e([pe({type:Number})],yt.prototype,"curvature",void 0),e([pe({type:Number})],yt.prototype,"width",void 0),e([pe({type:Number})],yt.prototype,"height",void 0),e([_e()],yt.prototype,"_isDragging",void 0),e([ue("canvas")],yt.prototype,"_canvas",void 0),yt=e([ce("transition-curve-editor")],yt);let xt=class extends re{constructor(){super(...arguments),this.selectedEntities=[],this.supportedEntities=new Map,this.collapsed={},this.includeAllLights=!1,this.z2mInstances=[],this.softwareTransitionEntities=[],this.entityAudioConfig={},this.audioOverrideEntity="",this._localCurvature=1,this._applyingCurvature=!1,this._curvatureApplied=!1,this._deviceZones=new Map,this._zoneEditing=new Map,this._zoneSaving=!1,this._instanceDevicesExpanded=new Set,this._audioConfigSelectedEntity=""}_localize(e,t){return it(this.translations,e,t)}_getEntityFriendlyName(e){return this.hass?lt(this.hass,e):e}_getEntityIcon(e){return this.hass?ct(this.hass,e):"mdi:lightbulb"}_getEntityDeviceType(e){return this.hass?ht(this.hass,e,this.supportedEntities,this.includeAllLights):null}_fireCollapsedChanged(e,t){this.dispatchEvent(new CustomEvent("collapsed-changed",{detail:{sectionId:e,collapsed:t},bubbles:!0,composed:!0}))}_fireGlobalPreferencesChanged(e){this.dispatchEvent(new CustomEvent("global-preferences-changed",{detail:e,bubbles:!0,composed:!0}))}_handleAudioOverrideEntityChange(e){this.dispatchEvent(new CustomEvent("audio-override-entity-changed",{detail:e.detail,bubbles:!0,composed:!0}))}_showToast(e){this.dispatchEvent(new CustomEvent("toast",{detail:{message:e},bubbles:!0,composed:!0}))}willUpdate(e){super.willUpdate(e),(e.has("selectedEntities")||e.has("supportedEntities"))&&(this._loadCurvatureFromEntity(),this._loadZonesForSelectedDevices())}_handleExpansionChange(e,t){const i=t.detail.expanded;this._fireCollapsedChanged(e,!i)}_toggleInstanceDevices(e){const t=new Set(this._instanceDevicesExpanded);t.has(e)?t.delete(e):t.add(e),this._instanceDevicesExpanded=t}_getSelectedDeviceTypes(){if(!this.selectedEntities.length||!this.hass)return[];const e=new Set;for(const t of this.selectedEntities){const i=this._getEntityDeviceType(t);i&&e.add(i)}return Array.from(e)}_getT2CompatibleEntities(){return this.hass?this.selectedEntities.filter(e=>{const t=this._getEntityDeviceType(e);return"t2_bulb"===t||"t2_cct"===t}):[]}_getT1StripCompatibleEntities(){return this.hass?this.selectedEntities.filter(e=>"t1_strip"===this._getEntityDeviceType(e)):[]}_getT1StripSegmentCount(){if(!this.selectedEntities.length||!this.hass)return 10;for(const e of this.selectedEntities){if("t1_strip"!==this._getEntityDeviceType(e))continue;const t=this.hass.states[e];if(!t)continue;let i;const s=t.attributes.length;if(s&&"number"==typeof s&&s>0&&(i=s),void 0===i){const t=e.split(".")[1]||"";for(const e of["number","sensor"]){const s=`${e}.${t}_length`,o=this.hass.states[s];if(o&&o.state&&"unknown"!==o.state&&"unavailable"!==o.state){const e=parseFloat(o.state);if(!isNaN(e)&&e>0){i=e;break}}}}if(void 0!==i&&i>0)return Math.floor(5*i)}return 10}_findSiblingNumberEntity(e,t){if(this.hass)return _t(this.hass,this.supportedEntities,e,t)}_findAllSiblingNumberEntities(e,t){return this.hass?function(e,t,i,s){const o=[];for(const a of i){const i=_t(e,t,a,s);i&&!o.includes(i)&&o.push(i)}return o}(this.hass,this.supportedEntities,e,t):[]}_findTransitionCurveEntity(){const e=this._getT2CompatibleEntities();for(const t of e){const e=this._findSiblingNumberEntity(t,"transition_curve_curvature");if(e)return e}}_findInitialBrightnessEntity(){const e=this._getT2CompatibleEntities();for(const t of e){const e=this._findSiblingNumberEntity(t,"transition_initial_brightness");if(e)return e}}_findAllTransitionCurveEntities(){return this._findAllSiblingNumberEntities(this._getT2CompatibleEntities(),"transition_curve_curvature")}_findAllInitialBrightnessEntities(){return this._findAllSiblingNumberEntities(this._getT2CompatibleEntities(),"transition_initial_brightness")}_findAllDimmingEntities(e){return this._findAllSiblingNumberEntities(this.selectedEntities,e)}_findDimmingEntity(e){for(const t of this.selectedEntities){if(!this.hass?.states[t])continue;const i=this._findSiblingNumberEntity(t,e);if(i)return i}}_findOnOffDurationEntity(){return this._findDimmingEntity("on_off_duration")}_findOffOnDurationEntity(){return this._findDimmingEntity("off_on_duration")}_findDimmingRangeMinEntity(){return this._findDimmingEntity("dimming_range_minimum")}_findDimmingRangeMaxEntity(){return this._findDimmingEntity("dimming_range_maximum")}_findT1StripLengthEntity(){const e=this._getT1StripCompatibleEntities();for(const t of e){const e=this._findSiblingNumberEntity(t,"length");if(e)return e}}_findAllT1StripLengthEntities(){return this._findAllSiblingNumberEntities(this._getT1StripCompatibleEntities(),"length")}_getSelectedSegmentDevices(){const e=new Map;for(const t of this.selectedEntities){const i=this.supportedEntities.get(t);if(!i?.ieee_address)continue;if("t1m"!==i.device_type&&"t1_strip"!==i.device_type)continue;if(e.has(i.ieee_address))continue;const s="t1_strip"===i.device_type?this._getT1StripSegmentCount():i.segment_count||0;0!==s&&e.set(i.ieee_address,{device_type:i.device_type,segment_count:s,z2m_friendly_name:i.z2m_friendly_name,entity_id:t})}return e}async _loadZonesForDevice(e){if(this.hass)try{const t=await this.hass.callApi("GET",`aqara_advanced_lighting/segment_zones/${encodeURIComponent(e)}`),i=Object.entries(t.zones||{}).map(([e,t])=>({name:e,segments:t}));this._deviceZones=new Map(this._deviceZones).set(e,i),this._zoneEditing=new Map(this._zoneEditing).set(e,i.map(e=>({...e})))}catch(e){}}async _loadZonesForSelectedDevices(){const e=this._getSelectedSegmentDevices();await Promise.all(Array.from(e.keys()).map(e=>this._loadZonesForDevice(e)))}_validateSegmentRange(e,t,i){const s=e.trim().toLowerCase();if(new Set(["odd","even","all","first-half","second-half"]).has(s))return null;const o=s.split(",");for(const e of o){const s=e.trim(),o=s.match(/^(\d+)-(\d+)$/);if(o){const e=parseInt(o[1]??"",10),a=parseInt(o[2]??"",10);if(isNaN(e)||isNaN(a))return this._localize("config.zone_invalid_range").replace("{name}",i).replace("{range}",s);if(e>t||a>t){const s=Math.max(e,a);return this._localize("config.zone_out_of_range").replace("{name}",i).replace("{segment}",String(s)).replace("{max}",String(t))}}else{const e=parseInt(s,10);if(isNaN(e))return this._localize("config.zone_invalid_range").replace("{name}",i).replace("{range}",s);if(e>t)return this._localize("config.zone_out_of_range").replace("{name}",i).replace("{segment}",String(e)).replace("{max}",String(t))}}return null}async _saveZones(e,t){const i=this._zoneEditing.get(e)||[],s={},o=new Set;for(const e of i){const i=e.name.trim(),a=e.segments.trim();if(!i&&!a)continue;if(!i)return void this._showToast(this._localize("config.zone_name_required"));if(!a)return void this._showToast(this._localize("config.zone_segments_required"));const n=i.toLowerCase();if(o.has(n))return void this._showToast(this._localize("config.zone_duplicate_name",{name:i}));o.add(n);const r=this._validateSegmentRange(a,t,i);if(r)return void this._showToast(r);s[i]=a}this._zoneSaving=!0;try{await this.hass.callApi("PUT",`aqara_advanced_lighting/segment_zones/${encodeURIComponent(e)}`,{zones:s}),await this._loadZonesForDevice(e),this._showToast(this._localize("config.zone_saved"))}catch(e){this._showToast(e?.body?.message||this._localize("config.zone_save_error"))}finally{this._zoneSaving=!1}}_addZoneRow(e){const t=[...this._zoneEditing.get(e)||[],{name:"",segments:""}];this._zoneEditing=new Map(this._zoneEditing).set(e,t)}async _removeZoneRow(e,t){const i=this._zoneEditing.get(e)||[],s=i[t];if(s){const t=(this._deviceZones.get(e)||[]).some(e=>e.name.toLowerCase()===s.name.trim().toLowerCase()&&""!==s.name.trim());if(t)try{return await this.hass.callApi("DELETE",`aqara_advanced_lighting/segment_zones/${encodeURIComponent(e)}/${encodeURIComponent(s.name.trim())}`),void await this._loadZonesForDevice(e)}catch{return void this._showToast(this._localize("config.zone_save_error"))}}const o=i.filter((e,i)=>i!==t);this._zoneEditing=new Map(this._zoneEditing).set(e,o)}_updateZoneField(e,t,i,s){const o=(this._zoneEditing.get(e)||[]).map((e,o)=>o===t?{...e,[i]:s}:e);this._zoneEditing=new Map(this._zoneEditing).set(e,o)}_zonesModified(e){const t=this._deviceZones.get(e)||[],i=this._zoneEditing.get(e)||[];return t.length!==i.length||t.some((e,t)=>e.name!==i[t]?.name||e.segments!==i[t]?.segments)}async _handleDimmingSettingChange(e,...t){if(!this.hass)return;const i=e.detail.value;if("number"!=typeof i)return;const s=[];for(const e of t)for(const t of this._findAllDimmingEntities(e))s.includes(t)||s.push(t);if(s.length)try{await Promise.all(s.map(e=>this.hass.callService("number","set_value",{entity_id:e,value:i})))}catch(e){}}async _handleDimmingRangeMinChange(e){const t=this._findDimmingRangeMinEntity(),i=this._findDimmingRangeMaxEntity();if(!this.hass||!t)return;const s=e.detail.value;if("number"!=typeof s)return;s>=(i&&this.hass.states[i]&&parseFloat(this.hass.states[i].state)||100)||await this._handleDimmingSettingChange(e,"dimming_range_minimum")}async _handleDimmingRangeMaxChange(e){const t=this._findDimmingRangeMinEntity(),i=this._findDimmingRangeMaxEntity();if(!this.hass||!i)return;const s=e.detail.value;if("number"!=typeof s)return;s<=(t&&this.hass.states[t]&&parseFloat(this.hass.states[t].state)||1)||await this._handleDimmingSettingChange(e,"dimming_range_maximum")}async _handleOnOffDurationChange(e){const t=this._findOnOffDurationEntity();this.hass&&t&&await this._handleDimmingSettingChange(e,"on_off_duration")}async _handleOffOnDurationChange(e){const t=this._findOffOnDurationEntity();this.hass&&t&&await this._handleDimmingSettingChange(e,"off_on_duration")}async _handleInitialBrightnessChange(e){if(!this.hass)return;const t=e.detail.value;if("number"!=typeof t)return;const i=this._findAllInitialBrightnessEntities();if(i.length)try{await Promise.all(i.map(e=>this.hass.callService("number","set_value",{entity_id:e,value:t})))}catch(e){}}async _handleT1StripLengthChange(e){if(!this.hass)return;const t=e.detail.value;if("number"!=typeof t)return;const i=this._findAllT1StripLengthEntities();if(i.length)try{await Promise.all(i.map(e=>this.hass.callService("number","set_value",{entity_id:e,value:t})))}catch(e){}}_handleCurvatureInput(e){const{curvature:t}=e.detail;"number"==typeof t&&(this._localCurvature=t)}_handleCurvatureNumberChange(e){const t=e.detail.value;if("number"==typeof t){const e=Math.max(.2,Math.min(6,t));this._localCurvature=Math.round(100*e)/100}}_getCurvatureDescription(){return this._localCurvature<.9?this._localize("config.curvature_fast_slow"):this._localCurvature<=1.1?this._localize("config.curvature_linear"):this._localize("config.curvature_slow_fast")}async _applyCurvature(){if(this.hass){this._applyingCurvature=!0;try{const e=this._findAllTransitionCurveEntities();e.length&&await Promise.all(e.map(e=>this.hass.callService("number","set_value",{entity_id:e,value:this._localCurvature}))),this._curvatureApplied=!0,this._showToast(this._localize("config.curvature_applied")),setTimeout(()=>{this._curvatureApplied=!1},2e3)}catch(e){this._showToast(this._localize("config.curvature_apply_error"))}finally{this._applyingCurvature=!1}}}_loadCurvatureFromEntity(){const e=this._findTransitionCurveEntity();if(this.hass&&e){const t=this.hass.states[e];if(t){const e=parseFloat(t.state);if(!isNaN(e)&&e>=.2&&e<=6)return void(this._localCurvature=Math.round(100*e)/100)}}}_softwareTransitionEntitiesChanged(e){const t=e.detail.value||[];this._fireGlobalPreferencesChanged({software_transition_entities:t})}_audioConfigEntityChanged(e){this._audioConfigSelectedEntity=e.detail.value||""}_updateEntityAudioConfig(e,t){const i=this._audioConfigSelectedEntity;if(!i)return;const s={...this.entityAudioConfig};s[i]={...s[i]||{},[e]:t},Object.values(s[i]).every(e=>!e)&&delete s[i],this._fireGlobalPreferencesChanged({entity_audio_config:s})}_deleteEntityAudioConfig(e){const t={...this.entityAudioConfig};delete t[e],this._audioConfigSelectedEntity===e&&(this._audioConfigSelectedEntity=""),this._fireGlobalPreferencesChanged({entity_audio_config:t})}render(){const e=this.selectedEntities.length>0,t=this._getSelectedDeviceTypes(),i=t.includes("t2_bulb")||t.includes("t2_cct"),s=t.includes("t1_strip"),o=t.includes("t1m")||t.includes("t1_strip"),a=this._findTransitionCurveEntity(),n=this._findInitialBrightnessEntity(),r=this._findT1StripLengthEntity(),l=this._findOnOffDurationEntity(),c=this._findOffOnDurationEntity(),d=this._findDimmingRangeMinEntity(),h=this._findDimmingRangeMaxEntity(),p=n&&this.hass?.states[n]&&parseFloat(this.hass.states[n].state)||0,_=r&&this.hass?.states[r]&&parseFloat(this.hass.states[r].state)||2,u=l&&this.hass?.states[l]&&parseFloat(this.hass.states[l].state)||0,g=c&&this.hass?.states[c]&&parseFloat(this.hass.states[c].state)||0,v=d&&this.hass?.states[d]&&parseFloat(this.hass.states[d].state)||1,m=h&&this.hass?.states[h]&&parseFloat(this.hass.states[h].state)||100,f=l||c||d||h;return N`
      <!-- Zigbee Instances Info Section -->
      <ha-expansion-panel
        outlined
        .expanded=${!this.collapsed.instances}
        @expanded-changed=${e=>this._handleExpansionChange("instances",e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("instances.section_title")}</div>
            <div class="section-subtitle">${(()=>{const e=this.z2mInstances.length,t=this.z2mInstances.reduce((e,t)=>e+t.device_counts.total,0),i=1===e&&1===t?"instances.subtitle_single":"instances.subtitle_plural";return this._localize(i,{count:String(e),devices:String(t)})})()}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 0;">
          ${0===this.z2mInstances.length?N`
                <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                  <ha-icon icon="mdi:information-outline" style="margin-right: 8px;"></ha-icon>
                  ${this._localize("instances.no_instances")}
                </div>
              `:N`
                <div class="instance-grid">
                  ${this.z2mInstances.map(e=>{const t=this._instanceDevicesExpanded.has(e.entry_id),i=t?e.devices:e.devices.slice(0,5),s=e.devices.length-5,o="z2m"===e.backend_type,a=[];return e.device_counts.t2_rgb>0&&a.push({key:"t2_rgb",count:e.device_counts.t2_rgb}),e.device_counts.t2_cct>0&&a.push({key:"t2_cct",count:e.device_counts.t2_cct}),e.device_counts.t1m>0&&a.push({key:"t1m",count:e.device_counts.t1m}),e.device_counts.t1_strip>0&&a.push({key:"t1_strip",count:e.device_counts.t1_strip}),e.device_counts.other>0&&a.push({key:"other",count:e.device_counts.other}),N`
                      <div class="instance-card">
                        <div class="instance-header">
                          <span class="instance-badge ${o?"instance-badge--z2m":"instance-badge--zha"}">
                            ${o?"Z2M":"ZHA"}
                          </span>
                          <div class="instance-info">
                            <span class="instance-name">${e.title}</span>
                            ${o&&e.z2m_base_topic&&e.title!==e.z2m_base_topic?N`
                              <span class="instance-topic">${e.z2m_base_topic}</span>
                            `:""}
                          </div>
                        </div>
                        ${a.length>0?N`
                          <div class="instance-type-chips">
                            ${a.map(e=>N`
                              <span class="instance-type-chip">${this._localize("instances."+e.key)} x${e.count}</span>
                            `)}
                          </div>
                        `:""}
                        ${e.devices.length>0?N`
                          <div class="instance-device-chips">
                            ${i.map(e=>N`
                              <span class="instance-device-chip">${e}</span>
                            `)}
                            ${!t&&s>0?N`
                              <span
                                class="instance-device-chip instance-device-chip--more"
                                @click=${()=>this._toggleInstanceDevices(e.entry_id)}
                              >
                                ${this._localize("instances.more_devices",{count:String(s)})}
                              </span>
                            `:""}
                            ${t&&s>0?N`
                              <span
                                class="instance-device-chip instance-device-chip--more"
                                @click=${()=>this._toggleInstanceDevices(e.entry_id)}
                              >
                                ${this._localize("instances.show_less")}
                              </span>
                            `:""}
                          </div>
                        `:""}
                      </div>
                    `})}
                </div>
              `}
        </div>
      </ha-expansion-panel>

      <!-- Generic Lights Section -->
      <ha-expansion-panel
        outlined
        .expanded=${void 0!==this.collapsed.generic_lights&&!this.collapsed.generic_lights}
        @expanded-changed=${e=>this._handleExpansionChange("generic_lights",e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("config.generic_lights_title")}</div>
            <div class="section-subtitle">${this._localize("config.generic_lights_subtitle")}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 16px;">
          <p style="margin: 0 0 16px 0; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">${this._localize("config.software_transitions_description")}</p>
          <ha-selector
            .hass=${this.hass}
            .selector=${{entity:{domain:"light",multiple:!0}}}
            .value=${this.softwareTransitionEntities}
            .label=${this._localize("config.software_transitions_label")}
            @value-changed=${this._softwareTransitionEntitiesChanged}
          ></ha-selector>

          <!-- On-device Audio Mode -->
          <div style="margin-top: 24px; border-top: 1px solid var(--divider-color); padding-top: 16px;">
            <p style="margin: 0 0 16px 0; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">${this._localize("config.audio_on_device_description")}</p>
            <ha-selector
              .hass=${this.hass}
              .selector=${{entity:{domain:"light"}}}
              .value=${this._audioConfigSelectedEntity}
              .label=${this._localize("config.audio_on_device_title")||"Use on-device audio mode"}
              @value-changed=${this._audioConfigEntityChanged}
            ></ha-selector>

            ${this._audioConfigSelectedEntity?N`
              <div style="margin-top: 16px; display: flex; flex-direction: column; gap: 16px;">
                ${Qe({label:this._localize("config.audio_on_service_label")||"Activate service (e.g., light.turn_on)",value:this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_on_service||"",onChange:e=>this._updateEntityAudioConfig("audio_on_service",e.target.value)})}
                ${Qe({label:this._localize("config.audio_on_service_data_label")||"Activate data (JSON)",value:this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_on_service_data||"",onChange:e=>this._updateEntityAudioConfig("audio_on_service_data",e.target.value)})}
                ${Qe({label:this._localize("config.audio_off_service_label")||"Deactivate service",value:this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_off_service||"",onChange:e=>this._updateEntityAudioConfig("audio_off_service",e.target.value)})}
                ${Qe({label:this._localize("config.audio_off_service_data_label")||"Deactivate data (JSON)",value:this.entityAudioConfig[this._audioConfigSelectedEntity]?.audio_off_service_data||"",onChange:e=>this._updateEntityAudioConfig("audio_off_service_data",e.target.value)})}
              </div>
            `:""}

            ${Object.keys(this.entityAudioConfig).length>0?N`
              <div style="margin-top: 16px; border-top: 1px solid var(--divider-color); padding-top: 12px;">
                <div style="font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color); margin-bottom: 8px;">On-device audio enabled lights</div>
                ${Object.keys(this.entityAudioConfig).map(e=>N`
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
                    <span
                      style="cursor: pointer; color: var(--primary-text-color); font-size: 14px;"
                      @click=${()=>{this._audioConfigSelectedEntity=e}}
                    >${this._getEntityFriendlyName(e)}</span>
                    <ha-icon-button
                      .path=${"M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"}
                      @click=${()=>this._deleteEntityAudioConfig(e)}
                    ></ha-icon-button>
                  </div>
                `)}
              </div>
            `:""}
          </div>
        </div>
      </ha-expansion-panel>

      <!-- Default Audio Sensor Section -->
      <ha-expansion-panel
        outlined
        .expanded=${void 0!==this.collapsed.default_audio_sensor&&!this.collapsed.default_audio_sensor}
        @expanded-changed=${e=>this._handleExpansionChange("default_audio_sensor",e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("config.default_audio_sensor_title")||"Default Audio Sensor"}</div>
            <div class="section-subtitle">${this._localize("config.default_audio_sensor_subtitle")||"Auto-populates audio sensor when creating presets"}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 16px;">
          <ha-selector
            .hass=${this.hass}
            .selector=${{entity:{domain:"binary_sensor"}}}
            .value=${this.audioOverrideEntity}
            @value-changed=${this._handleAudioOverrideEntityChange}
          ></ha-selector>
        </div>
      </ha-expansion-panel>

      ${e?"":N`
            <ha-card class="controls">
              <div class="control-row">
                <div class="control-input">
                  <ha-alert alert-type="info">
                    ${this._localize("config.select_light_message")}
                  </ha-alert>
                </div>
              </div>
            </ha-card>
          `}

      ${i?N`
            <ha-expansion-panel
              outlined
              .expanded=${!0}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("config.transition_settings")}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 0;">
                <div class="transition-settings-grid">
                  <div class="transition-curve-column">
                    <transition-curve-editor
                      .hass=${this.hass}
                      .curvature=${this._localCurvature}
                      @curvature-input=${this._handleCurvatureInput}
                    ></transition-curve-editor>
                  </div>
                  <div class="initial-brightness-column">
                    <div class="initial-brightness-content">
                      <!-- Curvature controls -->
                      <div class="form-section" style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid var(--divider-color);">
                        <div class="curve-control-row">
                          <div class="curve-control-info">
                            <span class="form-label">${this._localize("config.custom_curvature_label")}</span>
                            <div style="font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                              ${this._getCurvatureDescription()}
                            </div>
                          </div>
                          <div class="curve-control-actions">
                            <ha-selector
                              .hass=${this.hass}
                              .selector=${{number:{min:.2,max:6,step:.01,mode:"box"}}}
                              .value=${this._localCurvature}
                              @value-changed=${this._handleCurvatureNumberChange}
                              style="width: 80px;"
                            ></ha-selector>
                            <ha-button
                              @click=${this._applyCurvature}
                              ?disabled=${!a||this._applyingCurvature||this._curvatureApplied}
                            >
                              ${this._curvatureApplied?N`<ha-svg-icon .path=${"M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"}></ha-svg-icon> ${this._localize("config.curvature_applied_button")}`:this._applyingCurvature?this._localize("config.applying_button"):this._localize("config.apply_button")}
                            </ha-button>
                          </div>
                        </div>
                        <div class="curve-legend">
                          <span class="legend-item">
                            <span class="legend-dot fast-slow"></span>
                            ${this._localize("config.curve_legend_fast_slow")}
                          </span>
                          <span class="legend-item">
                            <span class="legend-dot linear"></span>
                            ${this._localize("config.curve_legend_linear")}
                          </span>
                          <span class="legend-item">
                            <span class="legend-dot slow-fast"></span>
                            ${this._localize("config.curve_legend_slow_fast")}
                          </span>
                        </div>
                      </div>

                      <!-- Initial Brightness -->
                      <div class="form-section">
                        <span class="form-label">${this._localize("config.initial_brightness_label")}</span>
                        <ha-selector
                          .hass=${this.hass}
                          .selector=${{number:{min:0,max:50,step:1,mode:"slider",unit_of_measurement:"%"}}}
                          .value=${p}
                          @value-changed=${e=>this._handleInitialBrightnessChange(e)}
                          ?disabled=${!n}
                        ></ha-selector>
                        ${n?"":N`
                          <div style="margin-top: 8px; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                            ${this._localize("config.initial_brightness_not_found")}
                          </div>
                        `}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `:""}

      ${e?N`
            <ha-expansion-panel
              outlined
              .expanded=${!0}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("config.dimming_settings_title")}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 0;">
                <div class="dimming-settings-grid">
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize("config.on_to_off_duration_label")}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{number:{min:0,max:10,step:.1,mode:"slider",unit_of_measurement:"s"}}}
                        .value=${u}
                        @value-changed=${e=>this._handleOnOffDurationChange(e)}
                        ?disabled=${!l}
                      ></ha-selector>
                      ${l?"":N`
                        <div class="entity-not-found">${this._localize("config.entity_not_found")}</div>
                      `}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize("config.off_to_on_duration_label")}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{number:{min:0,max:10,step:.1,mode:"slider",unit_of_measurement:"s"}}}
                        .value=${g}
                        @value-changed=${e=>this._handleOffOnDurationChange(e)}
                        ?disabled=${!c}
                      ></ha-selector>
                      ${c?"":N`
                        <div class="entity-not-found">${this._localize("config.entity_not_found")}</div>
                      `}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize("config.dimming_range_min_label")}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{number:{min:1,max:Math.min(99,m-1),step:1,mode:"slider",unit_of_measurement:"%"}}}
                        .value=${v}
                        @value-changed=${e=>this._handleDimmingRangeMinChange(e)}
                        ?disabled=${!d}
                      ></ha-selector>
                      ${d?"":N`
                        <div class="entity-not-found">${this._localize("config.entity_not_found")}</div>
                      `}
                    </div>
                  </div>
                  <div class="dimming-setting-item">
                    <div class="dimming-setting-content">
                      <span class="form-label">${this._localize("config.dimming_range_max_label")}</span>
                      <ha-selector
                        .hass=${this.hass}
                        .selector=${{number:{min:Math.max(2,v+1),max:100,step:1,mode:"slider",unit_of_measurement:"%"}}}
                        .value=${m}
                        @value-changed=${e=>this._handleDimmingRangeMaxChange(e)}
                        ?disabled=${!h}
                      ></ha-selector>
                      ${h?"":N`
                        <div class="entity-not-found">${this._localize("config.entity_not_found")}</div>
                      `}
                    </div>
                  </div>
                </div>
                ${f?"":N`
                  <div style="padding: 16px; text-align: center; color: var(--secondary-text-color);">
                    <ha-icon icon="mdi:information-outline" style="margin-right: 8px;"></ha-icon>
                    ${this._localize("config.dimming_not_available")}
                  </div>
                `}
              </div>
            </ha-expansion-panel>
          `:""}

      ${s?N`
            <ha-expansion-panel
              outlined
              .expanded=${!0}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("sections.t1_strip_settings")}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 16px;">
                <div class="form-section">
                  <span class="form-label">${this._localize("config.strip_length_label")}</span>
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{number:{min:1,max:10,step:.2,mode:"slider",unit_of_measurement:"m"}}}
                    .value=${_}
                    @value-changed=${e=>this._handleT1StripLengthChange(e)}
                    ?disabled=${!r}
                  ></ha-selector>
                  <div style="margin-top: 8px; font-size: var(--ha-font-size-s, 12px); color: var(--secondary-text-color);">
                    ${r?this._localize("config.strip_length_info"):this._localize("config.strip_length_not_found")}
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `:""}

      ${o?this._renderSegmentZonesSection():""}

    `}_renderSegmentZonesSection(){const e=this._getSelectedSegmentDevices();if(0===e.size){if(this.selectedEntities.length>0){if(this._getSelectedDeviceTypes().some(e=>"t1m"!==e&&"t1_strip"!==e))return N`
            <ha-expansion-panel outlined .expanded=${!1}>
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("config.segment_zones_title")}</div>
                  <div class="section-subtitle">${this._localize("config.segment_zones_subtitle")}</div>
                </div>
              </div>
              <div class="section-content" style="display: block; padding: 16px;">
                <ha-alert alert-type="info">
                  ${this._localize("config.zone_no_segment_devices")}
                </ha-alert>
              </div>
            </ha-expansion-panel>
          `}return""}const t=Array.from(e.keys()).reduce((e,t)=>e+(this._zoneEditing.get(t)||[]).length,0),i=e.size,s="segment_zones",o=void 0===this.collapsed[s]||!this.collapsed[s];return N`
      <ha-expansion-panel
        outlined
        .expanded=${o}
        @expanded-changed=${e=>this._handleExpansionChange(s,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("config.segment_zones_title")}</div>
            <div class="section-subtitle">${t>0?this._localize("config.segment_zones_subtitle_count",{zones:t.toString(),devices:i.toString()}):this._localize("config.segment_zones_subtitle")}</div>
          </div>
        </div>
        <div class="section-content" style="display: block; padding: 0;">
          ${Array.from(e.entries()).map(([e,t])=>{const i=this._zoneEditing.get(e)||[],s=this._zonesModified(e);return N`
              <div class="zone-device-section">
                <div class="zone-device-header">
                  <ha-icon icon="${this._getEntityIcon(t.entity_id)}"></ha-icon>
                  <span>${t.z2m_friendly_name}</span>
                  <span class="zone-device-segments">${this._localize("config.segment_count",{count:t.segment_count.toString()})}</span>
                </div>
                <div class="zone-device-toolbar">
                  <ha-button @click=${()=>this._addZoneRow(e)}>
                    <ha-icon icon="mdi:plus"></ha-icon>
                    <span class="zone-btn-label">${this._localize("config.zone_add_button")}</span>
                  </ha-button>
                  <div class="toolbar-spacer"></div>
                  ${s?N`
                    <span class="zone-unsaved-indicator">
                      <span class="zone-unsaved-dot"></span>
                      ${this._localize("config.zone_unsaved_changes")}
                    </span>
                  `:""}
                  <ha-button
                    @click=${()=>this._saveZones(e,t.segment_count)}
                    ?disabled=${!s||this._zoneSaving}
                  >
                    <ha-icon icon="mdi:content-save-outline"></ha-icon>
                    <span class="zone-btn-label">${this._localize("config.zone_save_button")}</span>
                  </ha-button>
                </div>
                ${0===i.length?N`
                    <div class="zone-empty-state">
                      <ha-icon icon="mdi:vector-square-plus"></ha-icon>
                      <span class="zone-empty-title">${this._localize("config.zone_no_zones")}</span>
                      <span class="zone-empty-hint">${this._localize("config.zone_empty_hint")}</span>
                    </div>`:N`
                    <div class="zone-list">
                      ${i.map((i,s)=>N`
                        <div class="zone-row">
                          <div class="zone-row-header">
                            <ha-selector
                              class="zone-name-input"
                              .hass=${this.hass}
                              .selector=${{text:{}}}
                              .value=${i.name}
                              .label=${this._localize("config.zone_name_label")}
                              @value-changed=${t=>this._updateZoneField(e,s,"name",t.detail.value)}
                            ></ha-selector>
                            <ha-icon-button
                              @click=${()=>this._removeZoneRow(e,s)}
                              title=${this._localize("config.zone_delete_tooltip")}
                            >
                              <ha-icon icon="mdi:delete-outline"></ha-icon>
                            </ha-icon-button>
                          </div>
                          <segment-selector
                            .mode=${"selection"}
                            .maxSegments=${t.segment_count}
                            .value=${i.segments}
                            .hideControls=${!0}
                            @value-changed=${t=>this._updateZoneField(e,s,"segments",t.detail.value)}
                          ></segment-selector>
                        </div>
                      `)}
                    </div>
                  `}
              </div>
            `})}
        </div>
      </ha-expansion-panel>
    `}};function $t(e,t,i,s){const o=function(e,t){const i=e.length;return t<1||i<1?[]:t===i?[...e]:Array.from({length:t},(s,o)=>e[Math.floor(o*i/t)])}(e.segments,i);return{id:"",name:`${e.name} ${s}`,device_type:t,segments:o.map((e,t)=>({segment:t+1,color:{r:e[0],g:e[1],b:e[2]}})),created_at:"",modified_at:""}}xt.styles=[ke,Me,Ie,qe,n`:host { overflow-y: visible; scrollbar-gutter: auto; }`],e([pe({attribute:!1})],xt.prototype,"hass",void 0),e([pe({attribute:!1})],xt.prototype,"selectedEntities",void 0),e([pe({attribute:!1})],xt.prototype,"supportedEntities",void 0),e([pe({attribute:!1})],xt.prototype,"translations",void 0),e([pe({attribute:!1})],xt.prototype,"collapsed",void 0),e([pe({attribute:!1})],xt.prototype,"includeAllLights",void 0),e([pe({attribute:!1})],xt.prototype,"z2mInstances",void 0),e([pe({attribute:!1})],xt.prototype,"softwareTransitionEntities",void 0),e([pe({attribute:!1})],xt.prototype,"entityAudioConfig",void 0),e([pe({type:String})],xt.prototype,"audioOverrideEntity",void 0),e([_e()],xt.prototype,"_localCurvature",void 0),e([_e()],xt.prototype,"_applyingCurvature",void 0),e([_e()],xt.prototype,"_curvatureApplied",void 0),e([_e()],xt.prototype,"_deviceZones",void 0),e([_e()],xt.prototype,"_zoneEditing",void 0),e([_e()],xt.prototype,"_zoneSaving",void 0),e([_e()],xt.prototype,"_instanceDevicesExpanded",void 0),e([_e()],xt.prototype,"_audioConfigSelectedEntity",void 0),xt=e([ce("aqara-config-tab")],xt);class wt extends me{constructor(e){if(super(e),this.it=G,e.type!==ge)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(e){if(e===G||null==e)return this._t=void 0,this.it=e;if(e===j)return e;if("string"!=typeof e)throw Error(this.constructor.directiveName+"() called with a non-string value");if(e===this.it)return this._t;this.it=e;const t=[e];return t.raw=t,this._t={_$litType$:this.constructor.resultType,strings:t,values:[]}}}wt.directiveName="unsafeHTML",wt.resultType=1;const St=ve(wt),Ct=200,zt=200,Et=180;function kt(e,t){const i=(e-90)*Math.PI/180;return[Math.round(100*(Ct+t*Math.cos(i)))/100,Math.round(100*(zt+t*Math.sin(i)))/100]}function Pt(e,t,i){if(t-e>=360)return`<circle cx="200" cy="200" r="180" fill="${i}" />`;const[s,o]=kt(e,Et),[a,n]=kt(t,Et);return`<path fill="${i}" stroke="${i}" stroke-width="1" d="M200,200 L${s},${o} A180,180 0 ${t-e>180?1:0},1 ${a},${n} Z" />`}function Mt(e){const t=Math.round(e.brightness_pct/100*255);return Fe(Ue(e.x,e.y,t))}const At=new Map;function Tt(e){if(e.length<=8)return e;const t=[];for(let i=0;i<8;i++){const s=Math.round(i/8*e.length)%e.length;t.push({hex:e[s].hex,startDeg:45*i,endDeg:45*(i+1)})}return t}function It(e){return Fe(Ve(e))}function Dt(e){return`<svg viewBox="20 20 360 360" xmlns="http://www.w3.org/2000/svg">${e}</svg>`}function qt(e){if(!e.segments||0===e.segments.length)return null;const t=function(e){if(0===e.length)return[];const t="seg:"+e.map(e=>`${e.segment}:${e.color.r},${e.color.g},${e.color.b}`).join("|"),i=At.get(t);if(i)return i;const s=[...e].sort((e,t)=>("number"==typeof e.segment?e.segment:parseInt(e.segment,10))-("number"==typeof t.segment?t.segment:parseInt(t.segment,10))),o=360/s.length,a=[];let n=Fe(s[0].color),r=0;for(let e=1;e<s.length;e++){const t=Fe(s[e].color);t!==n&&(a.push({hex:n,startDeg:r,endDeg:e*o}),n=t,r=e*o)}a.push({hex:n,startDeg:r,endDeg:360});const l=Tt(a);if(At.size>=64){const e=At.keys().next().value;void 0!==e&&At.delete(e)}return At.set(t,l),l}(e.segments),i=t.map(e=>Pt(e.startDeg,e.endDeg,e.hex)).join("");return N`${St(Dt(i))}`}function Ot(e){const t=(e.effect_colors??[]).slice(0,8);if(0===t.length)return null;if(1===t.length){const e=Le(t[0]);return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const i=360/t.length,s=t.map((e,t)=>Pt(t*i,(t+1)*i,Le(e))).join("");return N`${St(Dt(s))}`}function Bt(e){if(!e.steps||0===e.steps.length)return null;const t=e.steps[0];let i=[];if(t.segment_colors&&t.segment_colors.length>0?i=t.segment_colors.map(e=>Fe(e.color)):t.colors&&t.colors.length>0&&(i=t.colors.map(e=>Fe({r:e[0]??0,g:e[1]??0,b:e[2]??0}))),0===i.length)return null;const s=function(e){if(0===e.length)return[];const t="hex:"+e.join("|"),i=At.get(t);if(i)return i;const s=360/e.length,o=[];let a=e[0],n=0;for(let t=1;t<e.length;t++)e[t]!==a&&(o.push({hex:a,startDeg:n,endDeg:t*s}),a=e[t],n=t*s);o.push({hex:a,startDeg:n,endDeg:360});const r=Tt(o);if(At.size>=64){const e=At.keys().next().value;void 0!==e&&At.delete(e)}return At.set(t,r),r}(i);if(1===s.length)return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${s[0].hex}" />`))}`;const o=s.map(e=>Pt(e.startDeg,e.endDeg,e.hex)).join("");return N`${St(Dt(o))}`}function Ut(e){const t=e.match(/^(\d{1,2}):(\d{2})$/);if(t)return 60*parseInt(t[1],10)+parseInt(t[2],10);const i=e.match(/^(sunrise|sunset)([+-]\d+)?$/);if(i){return("sunrise"===i[1]?360:1080)+(i[2]?parseInt(i[2],10):0)}return 0}function Rt(e){if("solar"===e.mode)return function(e){const t=e.solar_steps??[];if(0===t.length)return null;const i=function(e){const t=e.filter(e=>"rising"===e.phase).sort((e,t)=>e.sun_elevation-t.sun_elevation),i=e.filter(e=>"any"===e.phase).sort((e,t)=>e.sun_elevation-t.sun_elevation),s=e.filter(e=>"setting"===e.phase).sort((e,t)=>t.sun_elevation-e.sun_elevation);return[...t,...i,...s]}(t),s=i.map(e=>e.color_temp),o='<line x1="20" y1="200" x2="380" y2="200" stroke="var(--secondary-text-color, #888)" stroke-width="2" stroke-opacity="0.3" />';if(1===s.length){const e=It(s[0]);return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${e}" />${o}`))}`}const a=`solar-${e.id}`,n=`solar-clip-${e.id}`,r=s.map((e,t)=>`<stop offset="${Math.round(t/(s.length-1)*100)}%" stop-color="${It(e)}" />`).join("");return N`${St(Dt(`<defs><clipPath id="${n}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${a}" x1="0" y1="0" x2="1" y2="0">${r}</linearGradient></defs><rect fill="url(#${a})" x="0" y="0" width="400" height="400" clip-path="url(#${n})" />`+o))}`}(e);if("schedule"===e.mode)return function(e){const t=e.schedule_steps??[];if(0===t.length)return null;const i=[...t].sort((e,t)=>Ut(e.time)-Ut(t.time)),s=i.map(e=>e.color_temp);if(1===s.length){const e=It(s[0]);return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const o=i.map(e=>Ut(e.time)),a=o[0],n=o[o.length-1]-a,r=`sched-${e.id}`,l=`sched-clip-${e.id}`,c=s.map((e,t)=>`<stop offset="${n>0?Math.round((o[t]-a)/n*100):Math.round(t/(s.length-1)*100)}%" stop-color="${It(e)}" />`).join("");return N`${St(Dt(`<defs><clipPath id="${l}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1">${c}</linearGradient></defs><rect fill="url(#${r})" x="0" y="0" width="400" height="400" clip-path="url(#${l})" />`))}`}(e);const t=(e.steps??[]).map(e=>e.color_temp).filter(e=>null!=e);if(0===t.length)return null;if(1===t.length){const e=It(t[0]);return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const i=`cct-${e.id}`,s=`cct-clip-${e.id}`,o=t.map((e,i)=>`<stop offset="${Math.round(i/(t.length-1)*100)}%" stop-color="${It(e)}" />`).join("");return N`${St(Dt(`<defs><clipPath id="${s}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${i}" x1="0" y1="0" x2="1" y2="0">${o}</linearGradient></defs><rect fill="url(#${i})" x="0" y="0" width="400" height="400" clip-path="url(#${s})" />`))}`}function Ft(e){const t=Ue(e.x,e.y,255),i=He(t.r,t.g,t.b);return 0===i.s?360:i.h}function Lt(e){if(!Array.isArray(e)&&e.thumbnail){const t=e.thumbnail;return N`<img
      src="/api/aqara_advanced_lighting/thumbnails/${t}"
      alt="Preset thumbnail"
      style="object-fit:cover"
    />`}let t,i;if(Array.isArray(e)?(t=e.slice(0,8),i=`ds-${t.map(e=>`${e.x}${e.y}`).join("")}`):(t=(e.colors??[]).slice(0,8),i=`ds-${e.id}`),0===t.length)return null;if(1===t.length){const e=Mt(t[0]);return N`${St(Dt(`<circle cx="200" cy="200" r="180" fill="${e}" />`))}`}const s=[...t].sort((e,t)=>Ft(e)-Ft(t)),o=`${i}-clip`,a=s.map((e,t)=>`<stop offset="${Math.round(t/(s.length-1)*100)}%" stop-color="${Mt(e)}" />`).join("");return N`${St(Dt(`<defs><clipPath id="${o}"><circle cx="200" cy="200" r="180" /></clipPath><linearGradient id="${i}" x1="0" y1="0" x2="1" y2="1">${a}</linearGradient></defs><rect fill="url(#${i})" x="0" y="0" width="400" height="400" clip-path="url(#${o})" />`))}`}const Ht={title:"Aqara Advanced Lighting",tabs:{activate:"Activate",effects:"Effects",patterns:"Patterns",cct:"CCT",segments:"Segments",scenes:"Scenes",presets:"My Presets",config:"Device Config"},status:{setting_up:"Setting up..."},errors:{title:"Error",loading_presets:"Failed to load presets. Please refresh the page.",loading_presets_generic:"Failed to load presets",no_presets_title:"No presets available",no_presets_message:"No built-in presets are available. Please check your configuration.",incompatible_light_title:"Incompatible light selected",incompatible_light_message:"One or more selected lights are not supported Aqara models. Please select only T1M, T1 Strip, or T2 bulb lights."},target:{section_title:"Lights",select_lights:"Select lights to control",lights_selected:"{count} light selected",lights_selected_plural:"{count} lights selected",lights_label:"Lights",favorites_label:"Favorite lights",favorite_name_label:"Favorite Name",light_control_label:"Light control",quick_controls_label:"Quick controls",custom_brightness_label:"Brightness",static_scene_mode_label:"Static scene mode",ignore_external_changes_label:"Ignore external changes",override_control_mode_label:"Change control mode",override_mode_pause_all:"Pause all",override_mode_pause_changed:"Pause changed only",bare_turn_on_only_label:"Parameterized turn-on",detect_non_ha_changes_label:"Non-HA changes",paused_brightness_only:"Brightness overridden",paused_color_only:"Color overridden",distribution_mode_override_label:"Scene color assignment",controls_card_title:"Active presets",activation_overrides_title:"Activation overrides",override_detection_title:"Change detection",effect_button:"Effect",cct_button:"CCT",solar_cct_button:"Solar CCT",schedule_cct_button:"Schedule CCT",segment_button:"Segment",scene_button:"Scene",running_operations_label:"Running presets",no_running_operations:"No active presets",pause:"Pause",resume:"Resume",stop:"Stop",paused:"Paused",externally_paused:"Externally paused",resume_control:"Resume control",entities_externally_paused:"{count} paused externally",no_lights_message:"Please select one or more lights to view available presets",group_label:"Group ({count} lights)",lights_count:"{count} lights",favorite_lights_count:"{count} lights",include_all_lights_label:"Include non-Aqara lights",include_all_lights_hint:"Show all light entities, not just Aqara devices. CCT sequences and dynamic scenes work with any light.",save_as_favorite:"Save selection as favorite",favorites_empty:"Save your first favorite for quick access",capability_cct:"CCT",capability_brightness:"Brightness",capability_on_off:"On/off",capability_software_transition:"Software transition",circadian_label:"Circadian",audio_reactive_label:"Scene audio reactive",effect_audio_reactive_label:"Effect audio reactive",effect_sensitivity_label:"Sensitivity",effect_detection_mode_label:"Detection mode",effect_speed_modulation_label:"Speed modulation",effect_brightness_modulation_label:"Brightness modulation",effect_silence_behavior_label:"Silence behavior",audio_entity_label:"Audio sensor entity",audio_tier_rich:"Beat sync",audio_sensor_unavailable:"Audio sensor unavailable",audio_bpm_label:"BPM",sensitivity:"Sensitivity",audio_squelch_label:"Noise gate",brightness_override_label:"Brightness"},devices:{t2_bulb:"T2 Bulb",t1:"T1",t1m:"T1M",t1_strip:"T1 Strip"},sections:{dynamic_effects:"Dynamic Effects",segment_patterns:"Segment Patterns",cct_sequences:"CCT Sequences",segment_sequences:"Segment Sequences",dynamic_scenes:"Dynamic Scenes",music_sync:"Music Sync",subtitle_presets:"{count} presets",subtitle_presets_custom:"{count} presets ({custom} custom)",subtitle_user_presets:"{count} presets",favorite_presets:"Favorite Presets",subtitle_favorites:"{count} favorites",t1_strip_settings:"T1 Strip settings"},presets:{manage_description:"Manage your saved presets.",manage_description_with_selection:"Click a preset to activate it, or use the edit/delete buttons.",no_presets_title:"No saved presets yet.",no_presets_description:"Use the other tabs to create and save your custom presets.",sort_custom:"Custom",sort_name_asc:"A-Z",sort_name_desc:"Z-A",sort_date_new:"New",sort_date_old:"Old",export_button:"Export",import_button:"Import",export_success:"Presets exported successfully",import_success:"{count} presets imported successfully",import_progress:"Importing presets...",export_progress:"Exporting presets...",import_error_invalid_file:"Invalid backup file format",import_error_unknown:"An unexpected error occurred",export_error_network:"Network error during export",select_button:"Select",restore_hidden_button:"Restore hidden",preset_hidden:"Preset hidden",presets_restored:"All hidden presets restored",select_cancel:"Cancel",select_all:"Select all",deselect_all:"Deselect all",export_selected_button:"Export selected ({count})",export_selected_success:"{count} presets exported",copy_suffix:"(copy)",presets_count:"{count} presets",default_audio_sensor:"Default audio sensor for audio-reactive presets"},dialogs:{create_effect_title:"Create Effect Preset",edit_effect_title:"Edit Effect Preset",create_effect_description:"Create custom dynamic effect presets with your choice of colors, speed, and brightness.",edit_effect_description:"Update your effect preset settings.",create_pattern_title:"Create Segment Pattern",edit_pattern_title:"Edit Segment Pattern",create_pattern_description:"Design custom segment patterns by setting individual segment colors.",edit_pattern_description:"Update your segment pattern settings.",create_cct_title:"Create CCT Sequence",edit_cct_title:"Edit CCT Sequence",create_cct_description:"Build color temperature sequences with multiple steps and timing controls.",edit_cct_description:"Update your CCT sequence settings.",create_segment_title:"Create Segment Sequence",edit_segment_title:"Edit Segment Sequence",create_segment_description:"Design animated segment sequences with multiple steps and transition effects.",edit_segment_description:"Update your segment sequence settings.",create_scene_title:"Create Dynamic Scene",edit_scene_title:"Edit Dynamic Scene",create_scene_description:"Create ambient lighting scenes with slow color transitions across multiple lights.",edit_scene_description:"Update your dynamic scene settings.",compatibility_warning_effects:"Preview not available, the selected light does not support dynamic effects. Compatible devices: T2 RGB bulb, T1M RGB endpoint, T1 Strip.",compatibility_warning_patterns:"Preview not available, the selected light does not support segment patterns. Compatible devices: T1M RGB endpoint, T1 Strip.",compatibility_warning_cct:"Preview not available, the selected light does not support CCT sequences. Compatible devices: T2 RGB bulb, T2 CCT bulb, T1M white endpoint, T1 Strip.",compatibility_warning_segments:"Preview not available, the selected light does not support segment sequences. Compatible devices: T1M RGB endpoint, T1 Strip.",compatibility_warning_scenes:"Preview not available, the selected light does not support RGB colors. Compatible devices: T2 RGB bulb, T1M RGB endpoint, T1 Strip."},config:{transition_settings:"T2 transition settings",custom_curvature_label:"Custom curvature",initial_brightness_label:"Initial brightness",on_to_off_duration_label:"On to off duration",off_to_on_duration_label:"Off to on duration",dimming_range_min_label:"Dimming range minimum",dimming_range_max_label:"Dimming range maximum",strip_length_label:"Strip length",select_light_message:"Select a light in the Activate tab to configure device-specific settings.",segment_zones_title:"Segment zones",segment_zones_subtitle:"Name segment ranges for quick selection and service calls",segment_zones_subtitle_count:"{zones} zones across {devices} devices",zone_name_label:"Zone name",zone_name_placeholder:"e.g. left side",zone_segments_label:"Segments",zone_segments_placeholder:"e.g. 1-8",zone_add_button:"Add zone",zone_save_button:"Save zones",zone_delete_tooltip:"Delete zone",zone_no_zones:"No zones defined",zone_empty_hint:"Add a zone to group segments for easier selection in editors and service calls.",zone_unsaved_changes:"Unsaved changes",zone_saved:"Zones saved successfully.",zone_save_error:"Failed to save zones.",zone_name_required:"Zone name is required.",zone_segments_required:"Select at least one segment for each zone.",zone_invalid_range:'Zone "{name}": invalid segment range "{range}"',zone_out_of_range:'Zone "{name}": segment {segment} exceeds device maximum of {max}',zone_no_segment_devices:"Segment zones are only available for devices that support segment addressing (T1M, T1 Strip).",zone_duplicate_name:'Duplicate zone name: "{name}"',dimming_settings_title:"Dimming settings",entity_not_found:"Entity not found for this device.",initial_brightness_not_found:"Initial brightness entity not found for this device.",dimming_not_available:"Dimming settings are not available for this device.",strip_length_info:"Each meter has 5 addressable RGB segments (20cm each).",strip_length_not_found:"Length entity not found for this device.",segment_count:"{count} segments",applying_button:"Applying...",apply_button:"Apply",curvature_applied_button:"Applied",curvature_applied:"Curvature setting applied successfully.",curvature_apply_error:"Failed to apply curvature setting.",curvature_fast_slow:"Fast start, slow end",curvature_linear:"Linear (uniform)",curvature_slow_fast:"Slow start, fast end",curve_legend_fast_slow:"0.2-1: Fast then slow",curve_legend_linear:"1: Linear",curve_legend_slow_fast:"1-6: Slow then fast",generic_lights_title:"Generic lights",generic_lights_subtitle:"Non-Aqara lights used in scenes and sequences",software_transitions_label:"Use software transitions",software_transitions_description:"Use the integration's cubic-easing transition engine instead of the light's hardware transitions. Enable this if you notice jerky transitions on specific lights.",no_generic_lights:"No generic lights have been used in scenes yet.",audio_on_device_title:"On-device audio mode",audio_on_device_description:"Configure service calls to activate/deactivate native audio-reactive mode on lights with built-in audio capabilities.",audio_on_service_label:"Activate service (e.g., light.turn_on)",audio_on_service_data_label:"Activate service data (JSON)",audio_off_service_label:"Deactivate service",audio_off_service_data_label:"Deactivate service data (JSON)",default_audio_sensor_title:"Default audio sensor",default_audio_sensor_subtitle:"Auto-populates audio sensor when creating presets or activating built-in presets"},instances:{section_title:"Zigbee integrations",subtitle_single:"{count} instance, {devices} device",subtitle_plural:"{count} instances, {devices} devices",no_instances:"No Zigbee instances found. Make sure the integration is properly configured.",t2_rgb:"T2 RGB",t2_cct:"T2 CCT",t1m:"T1M",t1_strip:"T1 Strip",other:"Other",more_devices:"+{count} more",show_less:"Show less"},transition_curve:{title:"Transition curve",subtitle:"Drag on the graph to adjust"},tooltips:{color_edit:"Click to edit color",color_remove:"Remove color",color_add:"Add color",step_move_up:"Move up",step_move_down:"Move down",step_duplicate:"Duplicate",step_remove:"Remove",favorite_save:"Save as favorite",favorite_rename:"Rename favorite",favorite_remove:"Remove favorite",favorite_preset_add:"Add to favorites",favorite_preset_remove:"Remove from favorites",preset_edit:"Edit preset",preset_duplicate:"Duplicate preset",preset_delete:"Delete preset",preset_hide:"Hide preset",version_mismatch:"Version mismatch detected: Backend (v{backend}) and frontend (v{frontend}) versions differ. Please refresh the page or restart Home Assistant to resolve this issue.",setup_in_progress:"The integration is still initializing. Device discovery is in progress and some features may not work correctly until setup completes."},options:{loop_mode_once:"Run once",loop_mode_count:"Loop N times",loop_mode_continuous:"Continuous loop",end_behavior_maintain:"Stay at last step",end_behavior_turn_off:"Turn off light",end_behavior_restore:"Restore previous state",activation_all:"All at once",activation_sequential_forward:"Sequential forward",activation_sequential_reverse:"Sequential reverse",activation_random:"Random",activation_ping_pong:"Ping pong",activation_center_out:"Center out",activation_edges_in:"Edges in",activation_paired:"Paired",phase_rising:"Rising (sun going up)",phase_setting:"Setting (sun going down)",phase_any:"Any direction"},editors:{name_label:"Name",icon_label:"Icon",icon_auto_hint:"Auto-generated from colors when not set",icon_clear_tooltip:"Clear icon and use auto-generated",cancel_button:"Cancel",unsaved_changes:"Unsaved changes",save_button:"Save",select_all_button:"Select all",clear_all_button:"Clear all",clear_selected_button:"Clear selected",clear_mode_on:"Clear: ON",clear_mode_off:"Clear: OFF",segments_selected:"{count} selected",zone_select_label:"Select zone...",select_mode_on:"Select: ON",select_mode_off:"Select: OFF",add_step_button:"Add step",apply_to_selected_button:"Apply to selected",loop_mode_label:"Loop mode",loop_count_label:"Loop count",end_behavior_label:"End behavior",device_type_label:"Device type",selected_device_type:"Selected device",skip_first_step_label:"Skip first step in loop",no_steps_message:'No steps defined. Click "Add step" to create your first step.',segments_label:"Segments",colors_label:"Colors (1-8)",colors_brightness_label:"Colors and brightness (1-8)",color_picker_title:"Select color",color_temp_label:"Color temp",apply_button:"Apply",color_temperature_label:"Color temperature ({value}K)",transition_time_label:"Transition time",hold_time_label:"Hold time",duration_label:"Duration",activation_pattern_label:"Activation pattern",speed_label:"Speed",effect_label:"Effect",segment_grid_label:"Segment grid",brightness_label:"Brightness",brightness_percent_label:"Brightness (%)",steps_label:"Steps (1-20)",select_lights_for_preview_effects:"Select light entities in the Activate tab to preview effects on your devices.",select_lights_for_preview_patterns:"Select light entities in the Activate tab to preview patterns on your devices.",select_lights_for_preview_sequences:"Select light entities in the Activate tab to preview sequences on your devices.",first_half_button:"First Half",second_half_button:"Second Half",odd_button:"Odd",even_button:"Even",individual_tab:"Individual",gradient_tab:"Gradient",blocks_tab:"Blocks",apply_to_grid_button:"Apply to Grid",expand_blocks_label:"Expand blocks to fill segments evenly",gradient_mode_description:"Create a smooth color gradient. Add 2-6 colors to blend.",blocks_mode_description:"Create evenly spaced blocks of color. Add 1-6 colors.",gradient_reverse_label:"Reverse direction",gradient_mirror_label:"Mirror gradient",gradient_wave_label:"Wave easing",gradient_repeat_label:"Repeat",gradient_wave_cycles_label:"Wave cycles",gradient_interpolation_label:"Interpolation",gradient_interp_shortest:"Shortest hue",gradient_interp_longest:"Longest hue",gradient_interp_rgb:"Linear RGB",preview_button:"Preview",stop_button:"Stop",update_button:"Update",clear_segments_label:"Clear Segments",gradient_min_colors_error:"Gradient mode requires at least 2 colors. Please add more colors to steps using gradient mode or change the mode.",tooltip_select_lights_first:"Select entities in Activate tab first",tooltip_light_not_compatible:"Selected light is not compatible",tooltip_light_no_cct:"Selected light does not support color temperature",tooltip_fix_gradient_errors:"Fix gradient validation errors first",turn_off_unspecified_label:"Turn off unspecified segments",incompatible_cct_endpoints:"One or more selected lights do not support color temperature control. CCT sequences require lights with color_temp capability. For T1M devices, select the white/CCT endpoint instead of the RGB ring endpoint.",mode_label:"Mode",mode_standard:"Standard",mode_schedule:"Schedule",mode_solar:"Solar",mode_solar_advanced:"Solar",sun_elevation_label:"Sun elevation ({value} degrees)",phase_label:"Phase",phase_rising:"Rising",phase_setting:"Setting",phase_any:"Any",adaptive_mode_hint:"Schedule and solar modes automatically adjust color temperature and brightness throughout the day.",auto_resume_delay_label:"Auto-resume delay",auto_resume_delay_hint:"Seconds before automatically resuming after manual change (0 = manual only)",solar_steps_label:"Solar steps (2-20)",schedule_label:"Label",schedule_time:"Time",schedule_time_hint:"e.g. 12:00 or sunrise+30",schedule_steps_label:"Schedule steps (2-20)",step_label:"Step {number}",timeline_sunrise:"Sunrise",timeline_sunset:"Sunset"},color_history:{recent_colors:"Recent colors",clear:"Clear"},music_sync:{title:"Music Sync",subtitle:"T1 Strip audio-reactive mode",enabled_label:"Music sync",sensitivity_label:"Sensitivity",sensitivity_low:"Low",sensitivity_high:"High",effect_label:"Effect",effect_random:"Random",effect_blink:"Blink",effect_rainbow:"Rainbow",effect_wave:"Wave",active_label:"Music sync active"},dynamic_scene:{add_color_button:"Add color",extract_from_image:"Extract from image",timing_label:"Timing",distribution_mode_label:"Color assignment",distribution_shuffle_rotate:"Shuffle and rotate",distribution_synchronized:"Synchronized",distribution_random:"Random",ripple_effect_label:"Transition stagger",random_order_label:"Randomize light order",scene_brightness_label:"Maximum scene brightness",offset_delay_label:"Offset delay between lights",end_behavior_restore:"Restore previous state",select_lights_for_preview:"Select light entities in the Activate tab to preview dynamic scenes on your devices.",audio_reactive_label:"Audio reactive",audio_entity_label:"Audio sensor entity",audio_sensitivity_label:"Sensitivity",audio_transition_speed_label:"Transition speed",audio_color_advance_label:"Color advance",audio_color_advance_on_onset:"Color cycle",audio_color_advance_continuous:"Continuous",audio_brightness_curve_label:"Brightness curve",audio_brightness_curve_disabled:"Disabled",audio_brightness_curve_linear:"Linear",audio_brightness_curve_logarithmic:"Logarithmic",audio_brightness_curve_exponential:"Exponential",audio_brightness_min_label:"Brightness min",audio_brightness_max_label:"Brightness max",audio_overrides_timing_note:"When audio reactive is enabled, transition time and hold time are controlled by the audio signal.",audio_mode_on_onset:"Color cycle",audio_mode_continuous:"Continuous",audio_mode_beat_predictive:"Beat predictive",audio_mode_intensity_breathing:"Intensity breathing",audio_mode_onset_flash:"Brightness flash",audio_mode_bass_kick:"Bass kick",audio_mode_bass_kick_desc:"Flashes brightness on kick-drum impacts. Uses the low-bass band (~80-240 Hz) on pro devices; falls back to the bass band on basic-tier devices.",audio_mode_freq_to_hue:"Freq to hue",audio_mode_freq_to_hue_desc:"Spectral centroid drives hue continuously. Higher frequencies produce cooler colors. Silence-gated so hue holds during quiet passages.",audio_mode_pro_badge:"pro",audio_mode_pro_badge_tooltip:"Modes labeled (pro) perform best on pro-tier audio devices (ESP32-S3 + PSRAM). Basic-tier devices will fall back to a simplified implementation.",audio_detection_mode_label:"Detection mode",audio_detection_spectral_flux:"Spectral flux (all genres)",audio_detection_bass_energy:"Bass energy (rhythmic music)",audio_frequency_zone_label:"Frequency zone distribution",audio_frequency_zone_helper:"Requires 3+ lights",audio_silence_behavior_label:"Silence behavior",audio_silence_hold:"Hold last color",audio_silence_slow_cycle:"Slow cycle",audio_silence_decay_min:"Decay to min",audio_silence_decay_mid:"Decay to mid",audio_prediction_aggressiveness_label:"Prediction aggressiveness",audio_latency_compensation_label:"Latency compensation",audio_detection_complex_domain:"Complex domain (phase + magnitude)",audio_color_by_frequency_label:"Color by frequency",audio_color_by_frequency_helper:"Map spectral brightness to palette position",audio_rolloff_brightness_label:"Rolloff brightness",audio_rolloff_brightness_helper:"Scale brightness by timbral brightness",audio_preset_label:"Audio preset",audio_preset_beat:"Beat",audio_preset_ambient:"Ambient",audio_preset_concert:"Concert",audio_preset_chill:"Chill",audio_preset_club:"Club",audio_preset_kick:"Kick",audio_preset_spectrum:"Spectrum",audio_preset_custom:"Custom"},image_extractor:{upload_tab:"Upload",url_tab:"URL",drop_hint:"Click or drop an image here",change_image:"Change image",url_label:"Image URL",extract_brightness:"Extract brightness from image",save_thumbnail:"Use image as preset thumbnail",extract_button:"Extract colors",cancel_button:"Cancel",error_no_file:"No file selected",error_server:"Error {status}",error_failed:"Extraction failed"},card:{name:"Aqara Advanced Lighting Presets",description:"Displays and activates your favorited Aqara Advanced Lighting presets for a specific entity.",default_title:"Favorite Presets",error_loading:"Failed to load preset data",empty_no_favorites:"No compatible favorites for this device",brightness_label:"Brightness",editor:{entities_label:"Entities",title_label:"Title",columns_label:"Grid columns",compact_label:"Compact mode",show_names_label:"Show preset names",highlight_user_label:"Highlight user presets",layout_label:"Layout",layout_grid:"Grid",layout_compact_grid:"Compact grid",layout_list:"List",layout_hero:"Hero",layout_carousel:"Carousel",brightness_override_label:"Brightness slider",brightness_override_position_label:"Slider position",brightness_override_position_header:"Header",brightness_override_position_footer:"Footer",preset_ids_label:"Presets shown",preset_ids_help:"Leave all checked and unmoved to use the global favorites order.",reset_to_global_button:"Reset to global order"}},effect_editor:{audio_reactive_label:"Audio reactive",audio_entity_label:"Audio sensor entity",audio_sensitivity_label:"Sensitivity",audio_silence_behavior_label:"Silence behavior",silence_hold:"Hold last values",silence_decay_min:"Decay to minimum",silence_decay_mid:"Decay to midpoint",speed_modulation_label:"Speed Modulation",audio_mode_label:"Mode",mode_volume:"Volume",mode_tempo:"Tempo",mode_combined:"Combined",range_min_label:"Range min",range_max_label:"Range max"}};function Nt(e){const t=e.length>0,i=e.includes("t2_bulb"),s=e.includes("t2_cct"),o=e.includes("t1m"),a=e.includes("t1m_white"),n=e.includes("t1_strip"),r=e.includes("generic_rgb"),l=e.includes("generic_cct");return{showDynamicEffects:t&&(i||o||n),showSegmentPatterns:t&&(o||n),showSegmentSequences:t&&(o||n),showCCTSequences:t&&(i||s||a||n||r||l),showDynamicScenes:t&&(i||s||o||a||n||r||l),showMusicSync:t&&n,hasT2:i,hasT1M:o,hasT1Strip:n,t2Presets:[],t1mPresets:[],t1StripPresets:[]}}function jt(e,t,i){if(0===t.length)return"cct_sequence"===e.type||"dynamic_scene"===e.type;const s=Nt(t),o=e=>{if(!e)return!0;switch(e){case"t2_bulb":return s.hasT2;case"t1m":case"t1":return s.hasT1M;case"t1_strip":return s.hasT1Strip;default:return!0}};switch(e.type){case"effect":return s.showDynamicEffects&&o(i);case"segment_pattern":return s.showSegmentPatterns&&o(i);case"cct_sequence":return s.showCCTSequences;case"segment_sequence":return s.showSegmentSequences&&o(i);case"dynamic_scene":return s.showDynamicScenes;default:return!1}}function Gt(e,t){return e?e.includes(".")?N`<img src="/api/aqara_advanced_lighting/icons/${e}" alt="preset icon" />`:N`<ha-icon icon="${e}"></ha-icon>`:N`<ha-icon icon="${t}"></ha-icon>`}const Wt=N`<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`,Vt=(e,t)=>t?N`${e}${Wt}`:e;function Zt(e,t,i,s={}){const o=!1!==s.showAudioBadge;switch(e.type){case"effect":return i?function(e,t){const i=t&&!!e.audio_config?.audio_speed_mode;if(e.icon)return Vt(Gt(e.icon,"mdi:lightbulb-on"),i);const s=Ot(e)??N`<ha-icon icon="mdi:lightbulb-on"></ha-icon>`;return Vt(s,i)}(t,o):function(e,t){const i=Gt(e.icon,"mdi:lightbulb-on"),s=t&&!!e.audio_speed_mode;return Vt(i,s)}(t,o);case"segment_pattern":return i?function(e){return e.icon?Gt(e.icon,"mdi:palette"):qt(e)??N`<ha-icon icon="mdi:palette"></ha-icon>`}(t):Gt(t.icon,"mdi:palette");case"cct_sequence":return i?function(e){return e.icon?Gt(e.icon,"mdi:temperature-kelvin"):Rt(e)??N`<ha-icon icon="mdi:temperature-kelvin"></ha-icon>`}(t):Gt(t.icon,"mdi:temperature-kelvin");case"segment_sequence":return i?function(e){return e.icon?Gt(e.icon,"mdi:animation-play"):Bt(e)??N`<ha-icon icon="mdi:animation-play"></ha-icon>`}(t):Gt(t.icon,"mdi:animation-play");case"dynamic_scene":return i?function(e,t){const i=t&&!(!e.audio_entity&&!e.audio_color_advance);if(e.thumbnail){const t=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`;return Vt(t,i)}if(e.icon)return Vt(Gt(e.icon,"mdi:lamps"),i);const s=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`;return Vt(s,i)}(t,o):function(e,t){const i=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`,s=t&&!!e.audio_color_advance;return Vt(i,s)}(t,o);default:return N`<ha-icon icon="mdi:star"></ha-icon>`}}const Yt=36e5,Xt=new Map,Kt=new Map;function Jt(e){Xt.delete(e),Kt.delete(e)}async function Qt(e,t,i){const s=function(e,t){const i=Xt.get(e);if(i&&Date.now()-i.timestamp<t)return i.data}(e,t);if(void 0!==s)return s;const o=Kt.get(e);if(o)return o;const a=i().then(t=>(function(e,t){Xt.set(e,{data:t,timestamp:Date.now()})}(e,t),t)).finally(()=>Kt.delete(e));return Kt.set(e,a),a}const ei=["_sub_bass_energy","_low_mid_energy","_upper_mid_energy","_air_energy","_beat_event","_calibration_stale"];async function ti(e){if(!e)return null;try{return(await e.callApi("GET","aqara_advanced_lighting/audio_mode_registry")).modes}catch(e){return null}}function ii(e,t){if(!t)return"unknown";if(!e?.entities)return"unknown";const i=e.entities[t];if(!i?.device_id)return"unknown";const s=i.device_id,o=Object.values(e.entities).filter(e=>e.device_id===s);if(0===o.length)return"unknown";const a=o.some(e=>{const t=e.entity_id??"";return ei.some(e=>t.endsWith(e))});return a?"pro":"basic"}function si(e,t,i){if(!e)return[];const s=i("dynamic_scene.audio_mode_pro_badge")||"pro";return e.filter(e=>!e.hidden).map(e=>{const o=`dynamic_scene.audio_mode_${e.constant}`,a=i(o)||e.display_label||e.constant,n=e.requires_pro&&"pro"!==t;return{value:e.constant,label:n?`${a} (${s})`:a}})}let oi=class extends re{constructor(){super(...arguments),this.color={x:.68,y:.31},this.size=220,this.showRgbInputs=!0,this.translations={},this.showCctSlider=!0,this.cctMin=2e3,this.cctMax=6500,this._isDragging=!1,this._editingColor={x:.68,y:.31},this._cctValue=4e3,this._cctActive=!1,this._drawnSize=0,this._rgbInputs=null,this._onPointerMove=e=>{this._isDragging&&(e.preventDefault(),this._handleWheelInteraction(e))},this._onPointerUp=()=>{this._isDragging=!1,this._marker?.classList.remove("dragging"),window.removeEventListener("mousemove",this._onPointerMove),window.removeEventListener("mouseup",this._onPointerUp),window.removeEventListener("touchmove",this._onPointerMove),window.removeEventListener("touchend",this._onPointerUp)},this._cctSliderDragging=!1,this._cachedCctGradient="",this._onCctMove=e=>{this._cctSliderDragging&&(e.preventDefault(),this._handleCctFromEvent(e))},this._onCctUp=()=>{this._cctSliderDragging=!1;const e=this.shadowRoot?.querySelector(".cct-slider-thumb");e?.classList.remove("dragging"),window.removeEventListener("mousemove",this._onCctMove),window.removeEventListener("mouseup",this._onCctUp),window.removeEventListener("touchmove",this._onCctMove),window.removeEventListener("touchend",this._onCctUp)}}firstUpdated(){this._editingColor={...this.color},this._drawColorWheel(),this._updateMarkerPosition()}updated(e){e.has("size")&&(this._drawColorWheel(),this._updateMarkerPosition()),e.has("color")&&!this._isDragging&&(this._editingColor={...this.color},this._updateMarkerPosition()),(e.has("cctMin")||e.has("cctMax"))&&(this._cachedCctGradient=this._computeCctGradient())}_drawColorWheel(){const e=this._canvas;if(!e)return;const t=this.size;if(t===this._drawnSize)return;const i=e.getContext("2d");if(!i)return;this._drawnSize=t;const s=t/2,o=t/2,a=t/2;e.width=t,e.height=t;for(let e=0;e<360;e++){const t=(e-1)*Math.PI/180,n=(e+1)*Math.PI/180,r=i.createRadialGradient(s,o,0,s,o,a);r.addColorStop(0,"hsl("+e+", 0%, 100%)"),r.addColorStop(1,"hsl("+e+", 100%, 50%)"),i.beginPath(),i.moveTo(s,o),i.arc(s,o,a,t,n),i.closePath(),i.fillStyle=r,i.fill()}}_updateMarkerPosition(){if(!this._marker)return;const e=je(this._editingColor),{x:t,y:i}=this._hsToPosition(e);this._marker.style.left=`${t}px`,this._marker.style.top=`${i}px`;const s=Ue(this._editingColor.x,this._editingColor.y,255),o=`#${s.r.toString(16).padStart(2,"0")}${s.g.toString(16).padStart(2,"0")}${s.b.toString(16).padStart(2,"0")}`;this._marker.style.backgroundColor=o}_hsToPosition(e){const t=this.size/2,i=this.size/2,s=this.size/2,o=e.h*Math.PI/180,a=e.s/100*s;return{x:t+a*Math.cos(o),y:i+a*Math.sin(o)}}_positionToHs(e,t){const i=this.size/2,s=this.size/2,o=this.size/2,a=e-i,n=t-s;let r=Math.sqrt(a*a+n*n);r=Math.min(r,o);let l=180*Math.atan2(n,a)/Math.PI;return l<0&&(l+=360),{h:Math.round(l)%360,s:Math.round(r/o*100)}}_handleWheelInteraction(e){const t=this._canvas;if(!t)return;const i=t.getBoundingClientRect();let s,o;if("touches"in e){const t=e.touches[0];if(!t)return;s=t.clientX,o=t.clientY}else s=e.clientX,o=e.clientY;const a=s-i.left,n=o-i.top,r=Ge(this._positionToHs(a,n));this._editingColor=r,this._cctActive=!1,this._updateMarkerPosition(),this._updateRgbInputs(r),this._fireColorChanged(r)}_handleRgbInput(e,t){const i=e.target,s=parseInt(i.value,10);if(isNaN(s)||s<0||s>255)return;const o=Ue(this._editingColor.x,this._editingColor.y,255),a={r:"r"===t?s:o.r,g:"g"===t?s:o.g,b:"b"===t?s:o.b},n=Re(a.r,a.g,a.b);this._editingColor=n,this._cctActive=!1,this._updateMarkerPosition(),this._fireColorChanged(n);const r=Ue(n.x,n.y,255),l="r"===t?r.r:"g"===t?r.g:r.b;i.title=l!==s?`Nearest: ${l} (gamut limit)`:""}_updateRgbInputs(e){if(!this._rgbInputs){const e=this.shadowRoot?.querySelectorAll(".rgb-input-field");if(!e||3!==e.length)return;this._rgbInputs=Array.from(e)}const t=Ue(e.x,e.y,255);this._rgbInputs[0].value=t.r.toString(),this._rgbInputs[1].value=t.g.toString(),this._rgbInputs[2].value=t.b.toString()}_fireColorChanged(e){this.dispatchEvent(new CustomEvent("color-changed",{detail:{color:e},bubbles:!0,composed:!0}))}_onPointerDown(e){e.preventDefault(),this._isDragging=!0,this._marker?.classList.add("dragging"),this._handleWheelInteraction(e),e instanceof MouseEvent?(window.addEventListener("mousemove",this._onPointerMove),window.addEventListener("mouseup",this._onPointerUp)):(window.addEventListener("touchmove",this._onPointerMove,{passive:!1}),window.addEventListener("touchend",this._onPointerUp))}_computeCctGradient(){const e=[];for(let t=0;t<=10;t++){const i=Ve(this.cctMin+t/10*(this.cctMax-this.cctMin));e.push(`rgb(${i.r},${i.g},${i.b}) ${t/10*100}%`)}return`linear-gradient(to right, ${e.join(", ")})`}_getCctGradient(){return this._cachedCctGradient||(this._cachedCctGradient=this._computeCctGradient()),this._cachedCctGradient}_handleCctFromEvent(e){const t=this.shadowRoot?.querySelector(".cct-slider-track");if(!t)return;const i=t.getBoundingClientRect();let s;if("touches"in e){const t=e.touches[0];if(!t)return;s=t.clientX}else s=e.clientX;const o=Math.max(0,Math.min(1,(s-i.left)/i.width)),a=Math.round(this.cctMin+o*(this.cctMax-this.cctMin));this._cctValue=a,this._cctActive=!0;const n=Ze(a);this._editingColor=n,this._updateMarkerPosition(),this._updateRgbInputs(n),this._fireColorChanged(n)}_onCctDown(e){e.preventDefault(),this._cctSliderDragging=!0,this._handleCctFromEvent(e);const t=this.shadowRoot?.querySelector(".cct-slider-thumb");t?.classList.add("dragging"),e instanceof MouseEvent?(window.addEventListener("mousemove",this._onCctMove),window.addEventListener("mouseup",this._onCctUp)):(window.addEventListener("touchmove",this._onCctMove,{passive:!1}),window.addEventListener("touchend",this._onCctUp))}_handleCctInput(e){const t=e.target,i=parseInt(t.value,10);if(isNaN(i)||i<this.cctMin||i>this.cctMax)return;this._cctValue=i,this._cctActive=!0;const s=Ze(i);this._editingColor=s,this._updateMarkerPosition(),this._updateRgbInputs(s),this._fireColorChanged(s)}_handleCctInputBlur(e){const t=e.target,i=parseInt(t.value,10);isNaN(i)||i<this.cctMin?t.value=this.cctMin.toString():i>this.cctMax&&(t.value=this.cctMax.toString())}_renderCctSlider(){const e=Ve(this._cctValue),t=(this._cctValue-this.cctMin)/(this.cctMax-this.cctMin)*100,i="editors.color_temp_label"!==it(this.translations,"editors.color_temp_label")?it(this.translations,"editors.color_temp_label"):"Color temp";return N`
      <div class="cct-slider-section">
        <div class="cct-slider-label">
          <span class="cct-slider-title">${i}</span>
          <div style="display: flex; align-items: center;">
            <input
              type="number"
              class="cct-slider-input ${this._cctActive?"":"inactive"}"
              min=${this.cctMin}
              max=${this.cctMax}
              .value=${this._cctValue.toString()}
              @input=${this._handleCctInput}
              @blur=${this._handleCctInputBlur}
            /><span class="cct-slider-input-suffix">K</span>
          </div>
        </div>
        <div
          class="cct-slider-track"
          @mousedown=${this._onCctDown}
          @touchstart=${this._onCctDown}
        >
          <div
            class="cct-slider-gradient"
            style="background: ${this._getCctGradient()}"
          ></div>
          <div
            class="cct-slider-thumb"
            style="left: ${t}%; background: rgb(${e.r},${e.g},${e.b})"
          ></div>
        </div>
        <div class="cct-slider-ticks">
          <span class="cct-slider-tick">${this.cctMin}K</span>
          <span class="cct-slider-tick">${this.cctMax}K</span>
        </div>
      </div>
    `}render(){const e=Ue(this._editingColor.x,this._editingColor.y,255);return N`
      <div class="color-picker-container">
        <div style="position: relative; width: ${this.size}px; height: ${this.size}px;">
          <canvas
            @mousedown=${this._onPointerDown}
            @touchstart=${this._onPointerDown}
          ></canvas>
          <div class="marker"></div>
        </div>
      </div>
      ${this.showCctSlider?this._renderCctSlider():""}
      ${this.showRgbInputs?N`
        <div class="rgb-inputs">
          <label class="rgb-input-label">
            <span class="rgb-input-channel">R</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${e.r.toString()}
              @change=${e=>this._handleRgbInput(e,"r")}
            />
          </label>
          <label class="rgb-input-label">
            <span class="rgb-input-channel">G</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${e.g.toString()}
              @change=${e=>this._handleRgbInput(e,"g")}
            />
          </label>
          <label class="rgb-input-label">
            <span class="rgb-input-channel">B</span>
            <input
              type="number"
              class="rgb-input-field"
              min="0"
              max="255"
              .value=${e.b.toString()}
              @change=${e=>this._handleRgbInput(e,"b")}
            />
          </label>
        </div>
      `:""}
    `}};oi.styles=n`
    :host {
      display: block;
      width: 100%;
    }

    .color-picker-container {
      position: relative;
      touch-action: none;
      display: flex;
      justify-content: center;
      margin: 20px 0;
    }

    canvas {
      border-radius: 50%;
      cursor: crosshair;
      display: block;
    }

    .marker {
      position: absolute;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 0 4px rgba(0, 0, 0, 0.5), inset 0 0 2px rgba(0, 0, 0, 0.3);
      pointer-events: none;
      transform: translate(-50%, -50%);
      transition: box-shadow 0.1s ease;
    }

    .marker.dragging {
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.7), inset 0 0 2px rgba(0, 0, 0, 0.3);
    }

    .rgb-inputs {
      display: flex;
      justify-content: center;
      gap: 12px;
      margin: 16px 0;
    }

    .rgb-input-label {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .rgb-input-channel {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
      text-transform: uppercase;
    }

    .rgb-input-field {
      width: 60px;
      padding: 6px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
      font-size: 14px;
      font-family: monospace;
      text-align: center;
    }

    .rgb-input-field:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    /* CCT Slider */
    .cct-slider-section {
      margin: 4px 0 8px;
      padding: 0 8px;
    }

    .cct-slider-label {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 6px;
    }

    .cct-slider-title {
      font-size: 12px;
      font-weight: 500;
      color: var(--secondary-text-color);
    }

    .cct-slider-input {
      width: 58px;
      padding: 2px 4px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      background: var(--secondary-background-color);
      color: var(--primary-text-color);
      font-size: 12px;
      font-family: monospace;
      text-align: center;
      transition: opacity 0.2s ease, border-color 0.2s ease;
      -moz-appearance: textfield;
    }

    .cct-slider-input::-webkit-outer-spin-button,
    .cct-slider-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .cct-slider-input:focus {
      outline: none;
      border-color: var(--primary-color);
      opacity: 1;
    }

    .cct-slider-input.inactive {
      opacity: 0.4;
    }

    .cct-slider-input-suffix {
      font-size: 12px;
      font-family: monospace;
      color: var(--secondary-text-color);
      margin-left: 2px;
    }

    .cct-slider-track {
      position: relative;
      height: 28px;
      border-radius: 14px;
      cursor: pointer;
      touch-action: none;
      overflow: visible;
    }

    .cct-slider-gradient {
      width: 100%;
      height: 100%;
      border-radius: 14px;
      box-shadow: inset 0 0 0 1px var(--divider-color);
    }

    .cct-slider-thumb {
      position: absolute;
      top: 50%;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: box-shadow 0.1s ease;
    }

    .cct-slider-thumb.dragging {
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.6);
    }

    .cct-slider-ticks {
      display: flex;
      justify-content: space-between;
      padding: 4px 2px 0;
    }

    .cct-slider-tick {
      font-size: 10px;
      color: var(--secondary-text-color);
      opacity: 0.6;
    }
  `,e([pe({type:Object})],oi.prototype,"color",void 0),e([pe({type:Number})],oi.prototype,"size",void 0),e([pe({type:Boolean})],oi.prototype,"showRgbInputs",void 0),e([pe({type:Object})],oi.prototype,"translations",void 0),e([pe({type:Boolean})],oi.prototype,"showCctSlider",void 0),e([pe({type:Number})],oi.prototype,"cctMin",void 0),e([pe({type:Number})],oi.prototype,"cctMax",void 0),e([_e()],oi.prototype,"_isDragging",void 0),e([_e()],oi.prototype,"_editingColor",void 0),e([_e()],oi.prototype,"_cctValue",void 0),e([_e()],oi.prototype,"_cctActive",void 0),e([ue("canvas")],oi.prototype,"_canvas",void 0),e([ue(".marker")],oi.prototype,"_marker",void 0),oi=e([ce("xy-color-picker")],oi);const ai={t2_bulb:["breathing","candlelight","fading","flash"],t1:["flow1","flow2","fading","hopping","breathing","rolling"],t1m:["flow1","flow2","fading","hopping","breathing","rolling"],t1_strip:["breathing","rainbow1","chasing","flash","hopping","rainbow2","flicker","dash"]};let ni=class extends(mt(re)){constructor(){super(...arguments),this.translations={},this.editMode=!1,this.hasSelectedEntities=!1,this.isCompatible=!0,this.previewActive=!1,this.stripSegmentCount=10,this.colorHistory=[],this.defaultAudioEntity="",this._reorderLayout="grid",this._colorIdCounter=0,this._name="",this._icon="",this._deviceType="t2_bulb",this._effect="",this._speed=50,this._brightness=100,this._steps=[{x:.68,y:.31,id:"initial-0"}],this._segments="",this._saving=!1,this._previewing=!1,this._editingColorIndex=null,this._editingColor=null,this._hasUserInteraction=!1,this._audioEnabled=!1,this._audioEntity="",this._audioSensitivity=50,this._audioSilenceBehavior="decay_min",this._audioSpeedMode="volume",this._audioSpeedMin=1,this._audioSpeedMax=100}_generateColorId(){return`color-${++this._colorIdCounter}-${Date.now()}`}_toColors(e){return e.map(e=>({x:e.x,y:e.y,id:this._generateColorId()}))}get _colors(){return this._steps}set _colors(e){this._steps=e}updated(e){super.updated(e),e.has("draft")&&this.draft?this._restoreDraft(this.draft):e.has("preset")&&(this.preset?(this._hasUserInteraction=!0,this._loadPreset(this.preset)):this._hasUserInteraction=!1),e.has("deviceContext")&&!this._hasUserInteraction&&this.deviceContext?.deviceType&&(this._deviceType=this.deviceContext.deviceType,this._effect="","t1_strip"!==this._deviceType||this._segments||(this._segments="all"))}_loadPreset(e){this._name=e.name,this._icon=e.icon||"",this._deviceType=e.device_type||"t2_bulb",this._effect=e.effect,this._speed=e.effect_speed,this._brightness=e.effect_brightness||100,this._colors=this._toColors(e.effect_colors.map(e=>"x"in e&&"y"in e?{x:e.x,y:e.y}:"r"in e&&"g"in e&&"b"in e?Re(e.r,e.g,e.b):{x:.68,y:.31})),this._segments=e.effect_segments||"",e.audio_config?(this._audioEnabled=!0,this._audioEntity=e.audio_config.audio_entity||"",this._audioSensitivity=e.audio_config.audio_sensitivity??50,this._audioSilenceBehavior=e.audio_config.audio_silence_behavior??"decay_min",this._audioSpeedMode=e.audio_config.audio_speed_mode||"volume",this._audioSpeedMin=e.audio_config.audio_speed_min??1,this._audioSpeedMax=e.audio_config.audio_speed_max??100):(this._audioEnabled=!1,this._audioEntity="")}getDraftState(){return{name:this._name,icon:this._icon,deviceType:this._deviceType,effect:this._effect,speed:this._speed,brightness:this._brightness,colors:this._colors.map(e=>({x:e.x,y:e.y})),segments:this._segments,hasUserInteraction:this._hasUserInteraction,audioConfig:this._audioEnabled?{audio_entity:this._audioEntity,audio_sensitivity:this._audioSensitivity,audio_silence_behavior:this._audioSilenceBehavior,audio_speed_mode:this._audioSpeedMode,audio_speed_min:this._audioSpeedMin,audio_speed_max:this._audioSpeedMax}:void 0}}resetToDefaults(){this._name="",this._icon="",this._deviceType="t2_bulb",this._effect="",this._speed=50,this._brightness=100,this._colors=this._toColors([{x:.68,y:.31}]),this._segments="",this._hasUserInteraction=!1,this._audioEnabled=!1,this._audioEntity="",this._audioSensitivity=50,this._audioSilenceBehavior="decay_min",this._audioSpeedMode="volume",this._audioSpeedMin=1,this._audioSpeedMax=100}_restoreDraft(e){this._name=e.name,this._icon=e.icon,this._deviceType=e.deviceType,this._effect=e.effect,this._speed=e.speed,this._brightness=e.brightness,this._colors=this._toColors(e.colors),this._segments=e.segments,this._hasUserInteraction=e.hasUserInteraction??!1,e.audioConfig?(this._audioEnabled=!0,this._audioEntity=e.audioConfig.audio_entity||"",this._audioSensitivity=e.audioConfig.audio_sensitivity??50,this._audioSilenceBehavior=e.audioConfig.audio_silence_behavior??"decay_min",this._audioSpeedMode=e.audioConfig.audio_speed_mode||"volume",this._audioSpeedMin=e.audioConfig.audio_speed_min??1,this._audioSpeedMax=e.audioConfig.audio_speed_max??100):this._audioEnabled=!1}_handleNameChange(e){this._name=e.detail.value||"",this._hasUserInteraction=!0}_handleIconChange(e){this._icon=e.detail.value||"",this._hasUserInteraction=!0}_handleDeviceTypeChange(e){this._deviceType=e.detail.value||"t2_bulb",this._hasUserInteraction=!0,this._effect="","t1_strip"!==this._deviceType||this._segments||(this._segments="all")}_handleSpeedChange(e){this._speed=e.detail.value??50,this._hasUserInteraction=!0}_handleBrightnessChange(e){this._brightness=e.detail.value??100,this._hasUserInteraction=!0}_handleSegmentsChange(e){this._segments=e.detail.value||"",this._hasUserInteraction=!0}_openColorPicker(e){const t=this._colors[e];t&&(this._editingColorIndex=e,this._editingColor=t)}_handleColorPickerChange(e){this._editingColor=e.detail.color}_confirmColorPicker(){if(null!==this._editingColorIndex&&null!==this._editingColor){const e=ut(this.colorHistory,this._editingColor);this.dispatchEvent(new CustomEvent("color-history-changed",{detail:{colorHistory:e},bubbles:!0,composed:!0})),this._colors=this._colors.map((e,t)=>t===this._editingColorIndex?{...this._editingColor,id:e.id}:e),this._hasUserInteraction=!0}this._closeColorPicker()}_handleHistoryColorSelected(e){const t=e.detail.color;this._editingColor={x:t.x,y:t.y}}_closeColorPicker(){this._editingColorIndex=null,this._editingColor=null}_addColor(){if(this._colors.length<8){const e=We(this._colors[this._colors.length-1]||{x:.68,y:.31});this._colors=[...this._colors,{...e,id:this._generateColorId()}],this._hasUserInteraction=!0}}_removeColor(e){this._colors.length>1&&(this._colors=this._colors.filter((t,i)=>i!==e),this._hasUserInteraction=!0)}_reorderStep(e,t){super._reorderStep(e,t),this._hasUserInteraction=!0}_handleAudioEnabledChange(e){this._audioEnabled=e.detail.value??!1,this._audioEnabled&&!this._audioEntity&&this.defaultAudioEntity&&(this._audioEntity=this.defaultAudioEntity),this._hasUserInteraction=!0}_handleAudioEntityChange(e){this._audioEntity=e.detail.value||"",this._hasUserInteraction=!0}_handleAudioSensitivityChange(e){this._audioSensitivity=e.detail.value??50,this._hasUserInteraction=!0}_handleAudioSilenceBehaviorChange(e){this._audioSilenceBehavior=e.detail.value||"decay_min",this._hasUserInteraction=!0}_handleAudioSpeedModeChange(e){this._audioSpeedMode=e.detail.value||"volume",this._hasUserInteraction=!0}_handleAudioSpeedMinChange(e){this._audioSpeedMin=e.detail.value??1,this._hasUserInteraction=!0}_handleAudioSpeedMaxChange(e){this._audioSpeedMax=e.detail.value??100,this._hasUserInteraction=!0}_getEffectIconUrl(e){return`/api/aqara_advanced_lighting/icons/${e}.svg`}_selectEffect(e){this._effect=e,this._hasUserInteraction=!0}_getPresetData(){const e={name:this._name,icon:this._icon||void 0,device_type:this._deviceType,effect:this._effect,effect_speed:this._speed,effect_brightness:this._brightness,effect_colors:this._colors.map(e=>({x:e.x,y:e.y}))};return"t1_strip"===this._deviceType&&this._segments&&(e.effect_segments=this._segments),this._audioEnabled&&this._audioEntity&&(e.audio_config={audio_entity:this._audioEntity,audio_sensitivity:this._audioSensitivity,audio_silence_behavior:this._audioSilenceBehavior,audio_speed_mode:this._audioSpeedMode,audio_speed_min:this._audioSpeedMin,audio_speed_max:this._audioSpeedMax}),e}async _preview(){if(this.hass&&this._effect&&!this._previewing){this._previewing=!0;try{this.dispatchEvent(new CustomEvent("preview",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._previewing=!1}}}_stopPreview(){this.dispatchEvent(new CustomEvent("stop-preview",{bubbles:!0,composed:!0}))}async _save(){if(this._name.trim()&&this._effect){this._saving=!0;try{this.dispatchEvent(new CustomEvent("save",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._saving=!1}}}_cancel(){this._hasUserInteraction=!1,this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_localize(e,t){return it(this.translations,e,t)}render(){const e=Object.entries(tt).map(([e,t])=>({value:e,label:t})),t=ai[this._deviceType]||[],i="t1_strip"===this._deviceType;return N`
      <div class="editor-content">
        <div class="form-row-triple">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.name_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{text:{}}}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.icon_label")}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{icon:{}}}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon?N`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${()=>{this._icon="",this._hasUserInteraction=!0}}
                  title=${this._localize("editors.icon_clear_tooltip")}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              `:""}
            </div>
            <span class="form-hint">${this._localize("editors.icon_auto_hint")}</span>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.device_type_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:e,mode:"dropdown"}}}
              .value=${this._deviceType}
              @value-changed=${this._handleDeviceTypeChange}
            ></ha-selector>
          </div>
        </div>

        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.speed_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:1,max:100,mode:"slider"}}}
              .value=${this._speed}
              @value-changed=${this._handleSpeedChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.brightness_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
              .value=${this._brightness}
              @value-changed=${this._handleBrightnessChange}
            ></ha-selector>
          </div>
        </div>

        ${i?N`
              <div class="form-section">
                <segment-selector
                  .hass=${this.hass}
                  .mode=${"selection"}
                  .maxSegments=${this.stripSegmentCount}
                  .value=${this._segments}
                  .label=${this._localize("editors.segments_label")}
                  .translations=${this.translations}
                  .zones=${this.deviceContext?.zones||[]}
                  @value-changed=${this._handleSegmentsChange}
                ></segment-selector>
              </div>
            `:""}

        <div class="form-section">
          <span class="form-label">${this._localize("editors.effect_label")}</span>
          <div class="effect-grid">
            ${t.map(e=>N`
                <div
                  class="effect-icon-btn ${this._effect===e?"selected":""}"
                  @click=${()=>this._selectEffect(e)}
                  title=${e}
                >
                  <div
                    class="effect-icon"
                    style="
                      -webkit-mask-image: url('${this._getEffectIconUrl(e)}');
                      mask-image: url('${this._getEffectIconUrl(e)}');
                    "
                  ></div>
                  <span>${e}</span>
                </div>
              `)}
          </div>
        </div>

        <div class="form-section">
          <span class="form-label">${this._localize("editors.colors_label")}</span>
          <div class="color-picker-grid step-list" style="position: relative;">
            ${this._renderGridDropIndicator()}
            ${this._colors.map((e,t)=>N`
                <div class="color-item step-item ${this._dragState.draggingIndex===t?"dragging":""}">
                  <div
                    class="color-drag-handle"
                    role="button"
                    aria-label="Reorder color ${t+1}"
                    @pointerdown=${e=>this._onDragHandlePointerDown(e,t)}
                  >
                    <ha-icon icon="mdi:drag"></ha-icon>
                  </div>
                  <div
                    class="color-swatch"
                    role="button"
                    tabindex="0"
                    style="background-color: ${Le(e)}"
                    @click=${()=>this._openColorPicker(t)}
                    @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._openColorPicker(t))}}
                    title="${this._localize("tooltips.color_edit")}"
                    aria-label="${this._localize("editors.color_label")||"Color"} ${t+1}: ${Le(e)}"
                  ></div>
                  ${this._colors.length>1?N`
                        <button
                          class="color-remove"
                          @click=${()=>this._removeColor(t)}
                          title="${this._localize("tooltips.color_remove")}"
                        >
                          <ha-icon icon="mdi:close"></ha-icon>
                        </button>
                      `:N`<div class="color-remove-spacer"></div>`}
                </div>
              `)}
            <div class="add-color-btn ${this._colors.length>=8?"disabled":""}">
              <div class="color-drag-handle-spacer"></div>
              <div
                class="add-color-icon"
                @click=${this._addColor}
                title="${this._localize("tooltips.color_add")}"
              >
                <ha-icon icon="mdi:plus"></ha-icon>
              </div>
              <div class="color-remove-spacer"></div>
            </div>
          </div>
        </div>

        ${"t2_bulb"!==this._deviceType&&"t2_cct"!==this._deviceType?N`
        <!-- Audio Reactive Section -->
        <div class="form-section">
          <div class="form-section boolean-left">
            <span class="form-label">${this._localize("effect_editor.audio_reactive_label")||"Audio reactive"}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{boolean:{}}}
              .value=${this._audioEnabled}
              @value-changed=${this._handleAudioEnabledChange}
            ></ha-selector>
          </div>

          ${this._audioEnabled?N`
            <!-- Audio entity + Sensitivity -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize("effect_editor.audio_entity_label")||"Audio sensor entity"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{entity:{domain:["binary_sensor","sensor"]}}}
                  .value=${this._audioEntity}
                  @value-changed=${this._handleAudioEntityChange}
                ></ha-selector>
              </div>
              <div class="form-field">
                <span class="form-label">${this._localize("effect_editor.audio_sensitivity_label")||"Sensitivity"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!this._audioEntity}
                  .selector=${{number:{min:1,max:100,mode:"slider"}}}
                  .value=${this._audioSensitivity}
                  @value-changed=${this._handleAudioSensitivityChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Silence behavior -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize("effect_editor.audio_silence_behavior_label")||"Silence behavior"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!this._audioEntity}
                  .selector=${{select:{options:[{value:"hold",label:this._localize("effect_editor.silence_hold")||"Hold last values"},{value:"decay_min",label:this._localize("effect_editor.silence_decay_min")||"Decay to minimum"},{value:"decay_mid",label:this._localize("effect_editor.silence_decay_mid")||"Decay to midpoint"}],mode:"dropdown"}}}
                  .value=${this._audioSilenceBehavior}
                  @value-changed=${this._handleAudioSilenceBehaviorChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Speed Modulation -->
            <div>
              <span class="form-label" style="font-weight: 500;">${this._localize("effect_editor.speed_modulation_label")||"Speed modulation"}</span>
              <div class="form-row-pair">
                <div class="form-field">
                  <span class="form-label">${this._localize("effect_editor.audio_mode_label")||"Mode"}</span>
                  <ha-selector
                    .hass=${this.hass}
                    .disabled=${!this._audioEntity}
                    .selector=${{select:{options:[{value:"volume",label:this._localize("effect_editor.mode_volume")||"Volume"}],mode:"dropdown"}}}
                    .value=${this._audioSpeedMode}
                    @value-changed=${this._handleAudioSpeedModeChange}
                  ></ha-selector>
                </div>
              </div>
              <div class="form-row-pair">
                <div class="form-field">
                  <span class="form-label">${this._localize("effect_editor.range_min_label")||"Range min"}</span>
                  <ha-selector
                    .hass=${this.hass}
                    .disabled=${!this._audioEntity}
                    .selector=${{number:{min:1,max:99,mode:"slider"}}}
                    .value=${this._audioSpeedMin}
                    @value-changed=${this._handleAudioSpeedMinChange}
                  ></ha-selector>
                </div>
                <div class="form-field">
                  <span class="form-label">${this._localize("effect_editor.range_max_label")||"Range max"}</span>
                  <ha-selector
                    .hass=${this.hass}
                    .disabled=${!this._audioEntity}
                    .selector=${{number:{min:2,max:100,mode:"slider"}}}
                    .value=${this._audioSpeedMax}
                    @value-changed=${this._handleAudioSpeedMaxChange}
                  ></ha-selector>
                </div>
              </div>
            </div>

            <!-- Brightness Modulation -->
          `:""}
        </div>
        `:""}

        <ha-dialog
          .open=${null!==this._editingColorIndex&&null!==this._editingColor}
          @closed=${this._closeColorPicker}
          .headerTitle=${this._localize("editors.color_picker_title")}
        >
          <span slot="headerNavigationIcon"></span>
          ${this._editingColor?N`
            <div
              slot="headerActionItems"
              class="color-picker-modal-preview"
              style="background-color: ${Le(this._editingColor)}"
            ></div>
          `:""}
          ${this._editingColor?N`
            <xy-color-picker
              .color=${this._editingColor}
              .size=${220}
              .showRgbInputs=${!0}
              .translations=${this.translations}
              @color-changed=${this._handleColorPickerChange}
            ></xy-color-picker>
            <color-history-swatches
              .colorHistory=${this.colorHistory}
              .translations=${this.translations}
              @color-selected=${this._handleHistoryColorSelected}
            ></color-history-swatches>
          `:""}
          ${Je(this._localize("editors.cancel_button"),this._localize("editors.apply_button"),()=>this._closeColorPicker(),()=>this._confirmColorPicker(),"mdi:check")}
        </ha-dialog>

        ${this.hasSelectedEntities?"":N`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize("editors.select_lights_for_preview_effects")}</span>
              </div>
            `}


        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize("editors.cancel_button")}</ha-button>
            ${this._hasUserInteraction?N`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize("editors.unsaved_changes")}
              </span>
            `:""}
          </div>
          ${this.previewActive?N`
                <ha-button @click=${this._stopPreview}>
                  <ha-icon icon="mdi:stop"></ha-icon>
                  <span class="btn-text">${this._localize("editors.stop_button")}</span>
                </ha-button>
              `:N`
                <ha-button
                  @click=${this._preview}
                  .disabled=${!this._effect||this._previewing||!this.hasSelectedEntities||!this.isCompatible}
                  title=${this.hasSelectedEntities?this.isCompatible?"":this._localize("editors.tooltip_light_not_compatible"):this._localize("editors.tooltip_select_lights_first")}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize("editors.preview_button")}</span>
                </ha-button>
              `}
          <ha-button @click=${this._save} .disabled=${!this._name.trim()||!this._effect||this._saving}>
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode?this._localize("editors.update_button"):this._localize("editors.save_button")}</span>
          </ha-button>
        </div>
      </div>
    `}};ni.styles=[Oe,at,vt,n`
    /* Effect icon grid selector */
    .effect-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .effect-icon-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px;
      min-width: 70px;
      background: var(--card-background-color);
      border: 2px solid var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .effect-icon-btn:hover {
      background: var(--secondary-background-color);
      border-color: var(--primary-color);
    }

    .effect-icon-btn.selected {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: var(--text-primary-color);
    }

    .effect-icon {
      width: 32px;
      height: 32px;
      margin-bottom: 4px;
      background-color: var(--primary-text-color);
      -webkit-mask-size: contain;
      mask-size: contain;
      -webkit-mask-repeat: no-repeat;
      mask-repeat: no-repeat;
      -webkit-mask-position: center;
      mask-position: center;
    }

    .effect-icon-btn.selected .effect-icon {
      background-color: var(--text-primary-color);
    }

    .effect-icon-btn span {
      font-size: 11px;
      text-transform: capitalize;
      text-align: center;
    }

    /* .color-remove and .add-color-btn inherited from colorPickerStyles (styles.ts) */

    .boolean-left ha-selector {
      display: flex;
      justify-content: flex-start;
    }
  `],e([pe({attribute:!1})],ni.prototype,"hass",void 0),e([pe({type:Object})],ni.prototype,"preset",void 0),e([pe({type:Object})],ni.prototype,"translations",void 0),e([pe({type:Boolean})],ni.prototype,"editMode",void 0),e([pe({type:Boolean})],ni.prototype,"hasSelectedEntities",void 0),e([pe({type:Boolean})],ni.prototype,"isCompatible",void 0),e([pe({type:Boolean})],ni.prototype,"previewActive",void 0),e([pe({type:Number})],ni.prototype,"stripSegmentCount",void 0),e([pe({type:Object})],ni.prototype,"deviceContext",void 0),e([pe({type:Array})],ni.prototype,"colorHistory",void 0),e([pe({type:Object})],ni.prototype,"draft",void 0),e([pe({type:String})],ni.prototype,"defaultAudioEntity",void 0),e([_e()],ni.prototype,"_name",void 0),e([_e()],ni.prototype,"_icon",void 0),e([_e()],ni.prototype,"_deviceType",void 0),e([_e()],ni.prototype,"_effect",void 0),e([_e()],ni.prototype,"_speed",void 0),e([_e()],ni.prototype,"_brightness",void 0),e([_e()],ni.prototype,"_steps",void 0),e([_e()],ni.prototype,"_segments",void 0),e([_e()],ni.prototype,"_saving",void 0),e([_e()],ni.prototype,"_previewing",void 0),e([_e()],ni.prototype,"_editingColorIndex",void 0),e([_e()],ni.prototype,"_editingColor",void 0),e([_e()],ni.prototype,"_hasUserInteraction",void 0),e([_e()],ni.prototype,"_audioEnabled",void 0),e([_e()],ni.prototype,"_audioEntity",void 0),e([_e()],ni.prototype,"_audioSensitivity",void 0),e([_e()],ni.prototype,"_audioSilenceBehavior",void 0),e([_e()],ni.prototype,"_audioSpeedMode",void 0),e([_e()],ni.prototype,"_audioSpeedMin",void 0),e([_e()],ni.prototype,"_audioSpeedMax",void 0),ni=e([ce("effect-editor")],ni);const ri={t1:20,t1m:26,t1_strip:50};let li=class extends re{constructor(){super(...arguments),this.translations={},this.editMode=!1,this.hasSelectedEntities=!1,this.isCompatible=!0,this.stripSegmentCount=10,this.colorHistory=[],this.previewActive=!1,this._name="",this._icon="",this._deviceType="t1m",this._segments=new Map,this._selectedSegments=new Set,this._saving=!1,this._previewing=!1,this._colorPalette=[...Ye],this._gradientColors=[{x:.68,y:.31},{x:.15,y:.06}],this._blockColors=[{x:.68,y:.31},{x:.17,y:.7}],this._expandBlocks=!1,this._gradientMirror=!1,this._gradientRepeat=1,this._gradientReverse=!1,this._gradientInterpolation="shortest",this._gradientWave=!1,this._gradientWaveCycles=1,this._turnOffUnspecified=!0,this._hasUserInteraction=!1}updated(e){if(super.updated(e),e.has("draft")&&this.draft?this._restoreDraft(this.draft):e.has("preset")&&(this.preset?(this._hasUserInteraction=!0,this._loadPreset(this.preset)):this._hasUserInteraction=!1),e.has("deviceContext")&&!this._hasUserInteraction&&this.deviceContext?.deviceType&&(this._deviceType=this.deviceContext.deviceType),e.has("stripSegmentCount")&&"t1_strip"===this._deviceType){const e=this._getMaxSegments();let t=!1;const i=new Map;for(const[s,o]of this._segments)s<e?i.set(s,o):t=!0;if(t){this._segments=i;const t=new Set;for(const i of this._selectedSegments)i<e&&t.add(i);this._selectedSegments=t}}}_getMaxSegments(){return"t1_strip"===this._deviceType?this.stripSegmentCount:ri[this._deviceType]||26}_loadPreset(e){this._name=e.name,this._icon=e.icon||"",this._deviceType=e.device_type||"t1m",this._segments=new Map,this._selectedSegments=new Set;for(const t of e.segments){const e="string"==typeof t.segment?parseInt(t.segment,10):t.segment,i=t.color;"x"in i&&"y"in i?this._segments.set(e-1,{x:i.x,y:i.y}):"r"in i&&"g"in i&&"b"in i&&this._segments.set(e-1,Re(i.r,i.g,i.b))}}getDraftState(){return{name:this._name,icon:this._icon,deviceType:this._deviceType,segments:Array.from(this._segments.entries()),colorPalette:[...this._colorPalette],gradientColors:[...this._gradientColors],blockColors:[...this._blockColors],expandBlocks:this._expandBlocks,gradientMirror:this._gradientMirror,gradientRepeat:this._gradientRepeat,gradientReverse:this._gradientReverse,gradientInterpolation:this._gradientInterpolation,gradientWave:this._gradientWave,gradientWaveCycles:this._gradientWaveCycles,turnOffUnspecified:this._turnOffUnspecified,hasUserInteraction:this._hasUserInteraction}}resetToDefaults(){this._name="",this._icon="",this._deviceType="t1m",this._segments=new Map,this._selectedSegments=new Set,this._colorPalette=[...Ye],this._gradientColors=[{x:.68,y:.31},{x:.15,y:.06}],this._blockColors=[{x:.68,y:.31},{x:.17,y:.7}],this._expandBlocks=!1,this._gradientMirror=!1,this._gradientRepeat=1,this._gradientReverse=!1,this._gradientInterpolation="shortest",this._gradientWave=!1,this._gradientWaveCycles=1,this._turnOffUnspecified=!0,this._hasUserInteraction=!1}_restoreDraft(e){this._name=e.name,this._icon=e.icon,this._deviceType=e.deviceType,this._segments=new Map(e.segments),this._colorPalette=[...e.colorPalette],this._gradientColors=[...e.gradientColors],this._blockColors=[...e.blockColors],this._expandBlocks=e.expandBlocks,this._gradientMirror=e.gradientMirror,this._gradientRepeat=e.gradientRepeat,this._gradientReverse=e.gradientReverse,this._gradientInterpolation=e.gradientInterpolation,this._gradientWave=e.gradientWave,this._gradientWaveCycles=e.gradientWaveCycles,this._turnOffUnspecified=e.turnOffUnspecified,this._hasUserInteraction=e.hasUserInteraction??!1}_handleNameChange(e){this._name=e.detail.value||"",this._hasUserInteraction=!0}_handleIconChange(e){this._icon=e.detail.value||"",this._hasUserInteraction=!0}_handleDeviceTypeChange(e){this._deviceType=e.detail.value||"t1m",this._hasUserInteraction=!0;const t=this._getMaxSegments(),i=new Map;for(const[e,s]of this._segments)e<t&&i.set(e,s);this._segments=i,this._selectedSegments=new Set}_handleColorValueChange(e){const{value:t}=e.detail;t instanceof Map&&(this._segments=t,this._hasUserInteraction=!0)}_handleGradientColorsChange(e){const{colors:t}=e.detail;Array.isArray(t)&&(this._gradientColors=t,this._hasUserInteraction=!0)}_handleBlockColorsChange(e){const{colors:t}=e.detail;Array.isArray(t)&&(this._blockColors=t,this._hasUserInteraction=!0)}_handleColorPaletteChange(e){const{colors:t}=e.detail;Array.isArray(t)&&(this._colorPalette=t,this._hasUserInteraction=!0)}_handleTurnOffUnspecifiedChange(e){this._turnOffUnspecified=e.detail.value,this._hasUserInteraction=!0}_getCurrentPattern(){return this._segments}_getPresetData(){const e=this._getCurrentPattern(),t=[];for(const[i,s]of e){const e=Ue(s.x,s.y,255);t.push({segment:i+1,color:{r:e.r,g:e.g,b:e.b}})}return{name:this._name,icon:this._icon||void 0,device_type:this._deviceType,segments:t,turn_off_unspecified:this._turnOffUnspecified}}async _preview(){if(!this.hass||this._previewing)return;if(0!==this._getCurrentPattern().size){this._previewing=!0;try{this.dispatchEvent(new CustomEvent("preview",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._previewing=!1}}}async _save(){if(!this._name.trim())return;if(0!==this._getCurrentPattern().size){this._saving=!0;try{this.dispatchEvent(new CustomEvent("save",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._saving=!1}}}_cancel(){this._hasUserInteraction=!1,this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_stopPreview(){this.dispatchEvent(new CustomEvent("stop-preview",{bubbles:!0,composed:!0}))}_canPreview(){return this._getCurrentPattern().size>0}_canSave(){if(!this._name.trim())return!1;return this._getCurrentPattern().size>0}_localize(e,t){return it(this.translations,e,t)}render(){const e=Object.entries(et).map(([e,t])=>({value:e,label:"t1_strip"===e?`T1 Strip (${this.stripSegmentCount} segments)`:t}));return N`
      <div class="editor-content">
        <div class="form-row-triple">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.name_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{text:{}}}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.icon_label")}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{icon:{}}}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon?N`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${()=>{this._icon="",this._hasUserInteraction=!0}}
                  title=${this._localize("editors.icon_clear_tooltip")}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              `:""}
            </div>
            <span class="form-hint">${this._localize("editors.icon_auto_hint")}</span>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.device_type_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:e,mode:"dropdown"}}}
              .value=${this._deviceType}
              @value-changed=${this._handleDeviceTypeChange}
            ></ha-selector>
          </div>
        </div>

        <div class="form-section">
          <span class="form-label">${this._localize("editors.segment_grid_label")}</span>
          <segment-selector
            .hass=${this.hass}
            .mode=${"color"}
            .maxSegments=${this._getMaxSegments()}
            .colorValue=${this._segments}
            .colorPalette=${this._colorPalette}
            .gradientColors=${this._gradientColors}
            .blockColors=${this._blockColors}
            .expandBlocks=${this._expandBlocks}
            .gradientMirror=${this._gradientMirror}
            .gradientRepeat=${this._gradientRepeat}
            .gradientReverse=${this._gradientReverse}
            .gradientInterpolation=${this._gradientInterpolation}
            .gradientWave=${this._gradientWave}
            .gradientWaveCycles=${this._gradientWaveCycles}
            .translations=${this.translations}
            .colorHistory=${this.colorHistory}
            .zones=${this.deviceContext?.zones||[]}
            .turnOffUnspecified=${this._turnOffUnspecified}
            @color-value-changed=${this._handleColorValueChange}
            @color-palette-changed=${this._handleColorPaletteChange}
            @gradient-colors-changed=${this._handleGradientColorsChange}
            @block-colors-changed=${this._handleBlockColorsChange}
            @turn-off-unspecified-changed=${this._handleTurnOffUnspecifiedChange}
          ></segment-selector>
        </div>

        ${this.hasSelectedEntities?"":N`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize("editors.select_lights_for_preview_patterns")}</span>
              </div>
            `}

        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize("editors.cancel_button")}</ha-button>
            ${this._hasUserInteraction?N`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize("editors.unsaved_changes")}
              </span>
            `:""}
          </div>
          ${this.previewActive?N`
                <ha-button @click=${this._stopPreview}>
                  <ha-icon icon="mdi:stop"></ha-icon>
                  <span class="btn-text">${this._localize("editors.stop_button")}</span>
                </ha-button>
              `:N`
                <ha-button
                  @click=${this._preview}
                  .disabled=${!this._canPreview()||this._previewing||!this.hasSelectedEntities||!this.isCompatible}
                  title=${this.hasSelectedEntities?this.isCompatible?"":this._localize("editors.tooltip_light_not_compatible"):this._localize("editors.tooltip_select_lights_first")}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize("editors.preview_button")}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._canSave()||this._saving}
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode?this._localize("editors.update_button"):this._localize("editors.save_button")}</span>
          </ha-button>
        </div>
      </div>
    `}};li.styles=[Oe,at,n`
    /* Sub-tabs for pattern modes */
    .mode-tabs {
      display: flex;
      gap: 4px;
      margin-bottom: 16px;
      border-bottom: 2px solid var(--divider-color);
    }

    .mode-tab {
      padding: 8px 16px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      color: var(--secondary-text-color);
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      transition: all 0.2s ease;
    }

    .mode-tab:hover {
      color: var(--primary-text-color);
      background: var(--secondary-background-color);
    }

    .mode-tab.active {
      color: var(--primary-color);
      border-bottom-color: var(--primary-color);
    }

    /* Color picker, palette, color-array, color-item, color-swatch,
       color-picker-modal, color-remove, add-color-btn styles
       are inherited from colorPickerStyles (styles.ts) */

    .palette-label {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-right: 8px;
    }

    /* Use color-picker-grid as alias for color-array in gradient/blocks modes */
    .color-array {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }

    /* Options row */
    .options-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .option-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .option-label {
      font-size: 13px;
      color: var(--secondary-text-color);
    }

    /* Mode description */
    .mode-description {
      font-size: 13px;
      color: var(--secondary-text-color);
      margin-bottom: 16px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      border-radius: 4px;
    }

    /* Clear mode toggle button */
    .clear-mode-toggle.active {
      color: var(--error-color);
    }

    /* Select mode toggle button */
    .select-mode-toggle.active {
      color: var(--info-color, #2196f3);
    }

    /* Generated pattern actions */
    .generated-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    /* Mode content container */
    .mode-content {
      background: var(--card-background-color);
      border-radius: 8px;
      padding: 16px;
    }

    @media (max-width: 600px) {
      .mode-tabs {
        overflow-x: auto;
      }

      .color-palette {
        justify-content: center;
      }
    }

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }
  `],e([pe({attribute:!1})],li.prototype,"hass",void 0),e([pe({type:Object})],li.prototype,"preset",void 0),e([pe({type:Object})],li.prototype,"translations",void 0),e([pe({type:Boolean})],li.prototype,"editMode",void 0),e([pe({type:Boolean})],li.prototype,"hasSelectedEntities",void 0),e([pe({type:Boolean})],li.prototype,"isCompatible",void 0),e([pe({type:Number})],li.prototype,"stripSegmentCount",void 0),e([pe({type:Object})],li.prototype,"deviceContext",void 0),e([pe({type:Array})],li.prototype,"colorHistory",void 0),e([pe({type:Boolean})],li.prototype,"previewActive",void 0),e([pe({type:Object})],li.prototype,"draft",void 0),e([_e()],li.prototype,"_name",void 0),e([_e()],li.prototype,"_icon",void 0),e([_e()],li.prototype,"_deviceType",void 0),e([_e()],li.prototype,"_segments",void 0),e([_e()],li.prototype,"_selectedSegments",void 0),e([_e()],li.prototype,"_saving",void 0),e([_e()],li.prototype,"_previewing",void 0),e([_e()],li.prototype,"_colorPalette",void 0),e([_e()],li.prototype,"_gradientColors",void 0),e([_e()],li.prototype,"_blockColors",void 0),e([_e()],li.prototype,"_expandBlocks",void 0),e([_e()],li.prototype,"_gradientMirror",void 0),e([_e()],li.prototype,"_gradientRepeat",void 0),e([_e()],li.prototype,"_gradientReverse",void 0),e([_e()],li.prototype,"_gradientInterpolation",void 0),e([_e()],li.prototype,"_gradientWave",void 0),e([_e()],li.prototype,"_gradientWaveCycles",void 0),e([_e()],li.prototype,"_turnOffUnspecified",void 0),e([_e()],li.prototype,"_hasUserInteraction",void 0),li=e([ce("pattern-editor")],li);let ci=class extends(mt(re)){constructor(){super(...arguments),this.translations={},this.editMode=!1,this.hasSelectedEntities=!1,this.isCompatible=!0,this.selectedEntities=[],this.previewActive=!1,this._name="",this._icon="",this._steps=[],this._loopMode="once",this._loopCount=3,this._endBehavior="maintain",this._skipFirstInLoop=!1,this._mode="standard",this._autoResumeDelay=0,this._solarSteps=[],this._scheduleSteps=[],this._saving=!1,this._previewing=!1,this._hasUserInteraction=!1,this._cachedLoopModeOptions=[],this._cachedEndBehaviorOptions=[],this._cachedModeOptions=[],this._cachedPhaseOptions=[]}willUpdate(e){if(e.has("translations")){const e=e=>this._localize(e);this._cachedLoopModeOptions=st(e),this._cachedEndBehaviorOptions=ot(e),this._cachedModeOptions=[{value:"standard",label:e("editors.mode_standard")},{value:"schedule",label:e("editors.mode_schedule")},{value:"solar",label:e("editors.mode_solar_advanced")}],this._cachedPhaseOptions=[{value:"rising",label:e("options.phase_rising")},{value:"setting",label:e("options.phase_setting")},{value:"any",label:e("options.phase_any")}]}}get _loopModeOptions(){return this._cachedLoopModeOptions}get _endBehaviorOptions(){return this._cachedEndBehaviorOptions}get _modeOptions(){return this._cachedModeOptions}get _phaseOptions(){return this._cachedPhaseOptions}connectedCallback(){super.connectedCallback(),0!==this._steps.length||this.preset||"standard"!==this._mode||this._addDefaultStep(),0!==this._solarSteps.length||this.preset||"solar"!==this._mode||this._addDefaultSolarSteps()}updated(e){super.updated(e),e.has("draft")&&this.draft?this._restoreDraft(this.draft):e.has("preset")&&this.preset&&(this._hasUserInteraction=!0,this._loadPreset(this.preset))}_loadPreset(e){this._name=e.name,this._icon=e.icon||"",this._loopMode=e.loop_mode,this._loopCount=e.loop_count||3,this._endBehavior=e.end_behavior,this._skipFirstInLoop=e.skip_first_in_loop||!1,"schedule"===e.mode&&e.schedule_steps?(this._mode="schedule",this._autoResumeDelay=e.auto_resume_delay||0,this._scheduleSteps=e.schedule_steps.map((e,t)=>({...e,brightness:Math.round(e.brightness/2.55),id:`sched-${t}-${Date.now()}`})),this._loopMode="continuous",this._endBehavior="maintain"):"solar"===e.mode&&e.solar_steps?(this._mode="solar",this._autoResumeDelay=e.auto_resume_delay||0,this._solarSteps=e.solar_steps.map((e,t)=>({...e,brightness:Math.round(e.brightness/2.55),id:`solar-${t}-${Date.now()}`})),this._loopMode="continuous",this._endBehavior="maintain"):(this._mode="standard",this._steps=e.steps.map((e,t)=>({...e,id:`step-${t}-${Date.now()}`})))}getDraftState(){return{name:this._name,icon:this._icon,steps:this._steps.map(e=>({color_temp:e.color_temp,brightness:e.brightness,transition:e.transition,hold:e.hold})),loopMode:this._loopMode,loopCount:this._loopCount,endBehavior:this._endBehavior,skipFirstInLoop:this._skipFirstInLoop,hasUserInteraction:this._hasUserInteraction,mode:this._mode,solarSteps:this._solarSteps.map(({id:e,...t})=>t),scheduleSteps:this._scheduleSteps.map(({id:e,...t})=>t),autoResumeDelay:this._autoResumeDelay}}resetToDefaults(){this._name="",this._icon="",this._mode="standard",this._loopMode="once",this._loopCount=3,this._endBehavior="maintain",this._skipFirstInLoop=!1,this._autoResumeDelay=0,this._hasUserInteraction=!1,this._solarSteps=[],this._scheduleSteps=[],this._addDefaultStep()}_restoreDraft(e){this._name=e.name,this._icon=e.icon,this._mode=e.mode||"standard",this._loopMode=e.loopMode,this._loopCount=e.loopCount,this._endBehavior=e.endBehavior,this._skipFirstInLoop=e.skipFirstInLoop,this._steps=e.steps.map((e,t)=>({...e,id:`step-${t}-${Date.now()}`})),this._solarSteps=(e.solarSteps||[]).map((e,t)=>({...e,id:`solar-${t}-${Date.now()}`})),this._scheduleSteps=(e.scheduleSteps||[]).map((e,t)=>({...e,id:`sched-${t}-${Date.now()}`})),this._autoResumeDelay=e.autoResumeDelay||0,this._hasUserInteraction=e.hasUserInteraction??!1}_addDefaultStep(){this._steps=[{id:`step-0-${Date.now()}`,color_temp:4e3,brightness:50,transition:15,hold:60}]}_generateStepId(){return`step-${this._steps.length}-${Date.now()}`}_handleNameChange(e){this._name=e.detail.value||"",this._hasUserInteraction=!0}_handleIconChange(e){this._icon=e.detail.value||"",this._hasUserInteraction=!0}_handleLoopModeChange(e){this._loopMode=e.detail.value||"once",this._hasUserInteraction=!0}_handleLoopCountChange(e){this._loopCount=e.detail.value??3,this._hasUserInteraction=!0}_handleEndBehaviorChange(e){this._endBehavior=e.detail.value||"maintain",this._hasUserInteraction=!0}_handleAutoResumeDelayChange(e){this._autoResumeDelay=Number(e.detail.value)||0,this._hasUserInteraction=!0}_handleSkipFirstInLoopChange(e){this._skipFirstInLoop=e.target.checked,this._hasUserInteraction=!0}_hasIncompatibleEndpoints(){if(!this.hass||!this.selectedEntities.length)return!1;for(const e of this.selectedEntities){const t=this.hass.states[e];if(!t)continue;const i=t.attributes.supported_color_modes;if(!i||!i.includes("color_temp"))return!0}return!1}_handleStepFieldChange(e,t,i){this._steps=this._steps.map(s=>s.id===e?{...s,[t]:i.detail.value}:s),this._hasUserInteraction=!0}_handleStepColorTempChange(e,t){const i=100*Math.round(t.detail.value/100);this._steps=this._steps.map(t=>t.id===e?{...t,color_temp:i}:t),this._hasUserInteraction=!0}_addStep(){if(this._steps.length>=20)return;const e=this._steps[this._steps.length-1],t={id:this._generateStepId(),color_temp:e?.color_temp??4e3,brightness:e?.brightness??50,transition:e?.transition??15,hold:e?.hold??60};this._steps=[...this._steps,t],this._hasUserInteraction=!0}_removeStep(e){this._steps.length<=1||(this._steps=this._steps.filter(t=>t.id!==e),this._hasUserInteraction=!0)}_moveStepUp(e){if(e<=0)return;const t=[...this._steps],i=t[e-1];t[e-1]=t[e],t[e]=i,this._steps=t,this._hasUserInteraction=!0}_moveStepDown(e){if(e>=this._steps.length-1)return;const t=[...this._steps],i=t[e];t[e]=t[e+1],t[e+1]=i,this._steps=t,this._hasUserInteraction=!0}_duplicateStep(e){if(this._steps.length>=20)return;const t={...e,id:this._generateStepId()},i=this._steps.findIndex(t=>t.id===e.id),s=[...this._steps];s.splice(i+1,0,t),this._steps=s,this._hasUserInteraction=!0}_getPresetData(){const e={name:this._name,icon:this._icon||void 0};if("schedule"===this._mode)e.mode="schedule",e.schedule_steps=this._scheduleSteps.map(({id:e,...t})=>({...t,brightness:Math.round(2.55*t.brightness)})),e.loop_mode="continuous",e.end_behavior="maintain",this._autoResumeDelay>0&&(e.auto_resume_delay=this._autoResumeDelay);else if("solar"===this._mode)e.mode="solar",e.solar_steps=this._solarSteps.map(({id:e,...t})=>({...t,brightness:Math.round(2.55*t.brightness)})),e.loop_mode="continuous",e.end_behavior="maintain",this._autoResumeDelay>0&&(e.auto_resume_delay=this._autoResumeDelay);else{const t=this._steps.map(({id:e,...t})=>t);e.steps=t,e.loop_mode=this._loopMode,e.end_behavior=this._endBehavior,e.skip_first_in_loop=this._skipFirstInLoop,"count"===this._loopMode&&(e.loop_count=this._loopCount)}return e}async _preview(){if(this.hass&&!this._previewing){this._previewing=!0;try{this.dispatchEvent(new CustomEvent("preview",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._previewing=!1}}}_stopPreview(){this.dispatchEvent(new CustomEvent("stop-preview",{bubbles:!0,composed:!0}))}async _save(){const e="standard"===this._mode?this._steps.length>0:"schedule"===this._mode?this._scheduleSteps.length>0:this._solarSteps.length>0;if(this._name.trim()&&e){this._saving=!0;try{this.dispatchEvent(new CustomEvent("save",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._saving=!1}}}_cancel(){this._hasUserInteraction=!1,this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_handleModeChange(e){const t=e.detail.value||"standard";t!==this._mode&&(this._mode=t,"solar"===t?(this._loopMode="continuous",this._endBehavior="maintain",0===this._solarSteps.length&&this._addDefaultSolarSteps()):"schedule"===t&&(this._loopMode="continuous",this._endBehavior="maintain",0===this._scheduleSteps.length&&this._addDefaultScheduleSteps()),this._hasUserInteraction=!0)}_addDefaultSolarSteps(){this._solarSteps=[{id:`solar-0-${Date.now()}`,sun_elevation:0,color_temp:4600,brightness:80,phase:"rising"},{id:`solar-1-${Date.now()}`,sun_elevation:0,color_temp:2700,brightness:40,phase:"setting"}]}_addSolarStep(){if(this._solarSteps.length>=20)return;const e=this._solarSteps[this._solarSteps.length-1],t={id:`solar-${this._solarSteps.length}-${Date.now()}`,sun_elevation:e?.sun_elevation??45,color_temp:e?.color_temp??4e3,brightness:e?.brightness??50,phase:e?.phase??"any"};this._solarSteps=[...this._solarSteps,t],this._hasUserInteraction=!0}_removeSolarStep(e){this._solarSteps.length<=1||(this._solarSteps=this._solarSteps.filter(t=>t.id!==e),this._hasUserInteraction=!0)}_handleSolarStepFieldChange(e,t,i){this._solarSteps=this._solarSteps.map(s=>s.id===e?{...s,[t]:i.detail.value}:s),this._hasUserInteraction=!0}_handleSolarStepColorTempChange(e,t){const i=100*Math.round(t.detail.value/100);this._solarSteps=this._solarSteps.map(t=>t.id===e?{...t,color_temp:i}:t),this._hasUserInteraction=!0}_onDragHandlePointerDown(e,t){const i="solar"===this._mode?this._solarSteps:"schedule"===this._mode?this._scheduleSteps:this._steps,s=this._steps;this._steps=i,super._onDragHandlePointerDown(e,t),this._steps=s}_reorderStep(e,t){if("solar"===this._mode){const i=[...this._solarSteps],[s]=i.splice(e,1),o=e<t?t-1:t;i.splice(o,0,s),this._solarSteps=i,this._hasUserInteraction=!0}else if("schedule"===this._mode){const i=[...this._scheduleSteps],[s]=i.splice(e,1),o=e<t?t-1:t;i.splice(o,0,s),this._scheduleSteps=i,this._hasUserInteraction=!0}else super._reorderStep(e,t)}_moveSolarStepUp(e){if(e<=0)return;const t=[...this._solarSteps],i=t[e-1];t[e-1]=t[e],t[e]=i,this._solarSteps=t,this._hasUserInteraction=!0}_moveSolarStepDown(e){if(e>=this._solarSteps.length-1)return;const t=[...this._solarSteps],i=t[e];t[e]=t[e+1],t[e+1]=i,this._solarSteps=t,this._hasUserInteraction=!0}_duplicateSolarStep(e){if(this._solarSteps.length>=20)return;const t={...e,id:`solar-${this._solarSteps.length}-${Date.now()}`},i=this._solarSteps.findIndex(t=>t.id===e.id),s=[...this._solarSteps];s.splice(i+1,0,t),this._solarSteps=s,this._hasUserInteraction=!0}_addDefaultScheduleSteps(){this._scheduleSteps=[{id:`sched-0-${Date.now()}`,time:"sunrise-30",color_temp:2700,brightness:40,label:"Dawn"},{id:`sched-1-${Date.now()}`,time:"sunrise+30",color_temp:3500,brightness:70,label:"Morning"},{id:`sched-2-${Date.now()}`,time:"12:00",color_temp:5500,brightness:100,label:"Midday"},{id:`sched-3-${Date.now()}`,time:"sunset-120",color_temp:4500,brightness:90,label:"Afternoon"},{id:`sched-4-${Date.now()}`,time:"sunset+0",color_temp:3e3,brightness:60,label:"Evening"},{id:`sched-5-${Date.now()}`,time:"sunset+90",color_temp:2700,brightness:40,label:"Night"}]}_addScheduleStep(){if(this._scheduleSteps.length>=20)return;const e=this._scheduleSteps[this._scheduleSteps.length-1];this._scheduleSteps=[...this._scheduleSteps,{id:`sched-${this._scheduleSteps.length}-${Date.now()}`,time:"12:00",color_temp:e?.color_temp??4e3,brightness:e?.brightness??70,label:""}],this._hasUserInteraction=!0}_removeScheduleStep(e){this._scheduleSteps.length<=2||(this._scheduleSteps=this._scheduleSteps.filter(t=>t.id!==e),this._hasUserInteraction=!0)}_duplicateScheduleStep(e){if(this._scheduleSteps.length>=20)return;const t=this._scheduleSteps.findIndex(t=>t.id===e.id),i={...e,id:`sched-${this._scheduleSteps.length}-${Date.now()}`},s=[...this._scheduleSteps];s.splice(t+1,0,i),this._scheduleSteps=s,this._hasUserInteraction=!0}_moveScheduleStepUp(e){if(e<=0)return;const t=[...this._scheduleSteps];[t[e-1],t[e]]=[t[e],t[e-1]],this._scheduleSteps=t,this._hasUserInteraction=!0}_moveScheduleStepDown(e){if(e>=this._scheduleSteps.length-1)return;const t=[...this._scheduleSteps];[t[e],t[e+1]]=[t[e+1],t[e]],this._scheduleSteps=t,this._hasUserInteraction=!0}_handleScheduleStepColorTempChange(e,t){const i=100*Math.round(Number(t.detail.value)/100);this._scheduleSteps=this._scheduleSteps.map(t=>t.id===e?{...t,color_temp:i}:t),this._hasUserInteraction=!0}_colorTempToCSS(e){const t=Math.max(0,Math.min(1,(e-2700)/3800));return`rgb(${Math.round(255-20*t)}, ${Math.round(147+93*t)}, ${Math.round(41+214*t)})`}_getSunTimes(){const e={sunrise:420,sunset:1140},t=this.hass?.states?.["sun.sun"];if(!t)return e;const i=t.attributes.next_rising,s=t.attributes.next_setting;if(!i||!s)return e;const o=e=>{const t=new Date(e);return isNaN(t.getTime())?null:60*t.getHours()+t.getMinutes()};return{sunrise:o(i)??e.sunrise,sunset:o(s)??e.sunset}}_resolveTimeMinutes(e){const t=e.match(/^([01]\d|2[0-3]):([0-5]\d)$/);if(t)return 60*parseInt(t[1],10)+parseInt(t[2],10);const i=e.match(/^(sunrise|sunset)([+-]\d{1,3})$/);if(i){const e=this._getSunTimes();return("sunrise"===i[1]?e.sunrise:e.sunset)+parseInt(i[2],10)}return null}_renderDualTrackBar(e){const{points:t,markers:i,axisLabels:s,wrapGradient:o}=e,a=[],n=[];for(const e of t){a.push(`${this._colorTempToCSS(e.color_temp)} ${e.pct.toFixed(1)}%`);const t=Math.round(2.55*e.brightness);n.push(`rgb(${t}, ${t}, ${t}) ${e.pct.toFixed(1)}%`)}if(o){a.push(`${this._colorTempToCSS(t[0].color_temp)} 100%`);const e=Math.round(2.55*t[0].brightness);n.push(`rgb(${e}, ${e}, ${e}) 100%`)}const r=`linear-gradient(to right, ${a.join(", ")})`,l=`linear-gradient(to right, ${n.join(", ")})`;return N`
      <div class="timeline-preview">
        <div class="timeline-bar-container">
          <div class="timeline-bar timeline-ct" style="background: ${r}">
            ${(i||[]).map(e=>N`
              <div class="timeline-marker" style="left: ${e.pct}%" title="${e.title}">
                <div class="marker-line"></div>
                <ha-icon icon="${e.icon}" class="marker-icon"></ha-icon>
              </div>
            `)}
            ${t.map(e=>N`
              <div class="timeline-step-dot" style="left: ${e.pct}%"
                   title="${e.tooltip}">
              </div>
            `)}
          </div>
          <div class="timeline-bar timeline-br" style="background: ${l}"></div>
          <div class="timeline-track-labels">
            <span class="timeline-track-label">
              <ha-icon icon="mdi:thermometer" class="track-icon"></ha-icon>
            </span>
            <span class="timeline-track-label">
              <ha-icon icon="mdi:brightness-6" class="track-icon"></ha-icon>
            </span>
          </div>
          <div class="timeline-hours">
            ${s.map(e=>N`
              <span class="timeline-hour" style="left: ${e.pct}%">${e.text}</span>
            `)}
          </div>
        </div>
        <div class="timeline-labels">
          ${t.filter(e=>e.label).map(e=>N`
            <span class="timeline-label" style="left: ${e.pct}%">
              <span class="full-label">${e.label}</span>
              <span class="short-label">${e.shortLabel??e.label}</span>
            </span>
          `)}
        </div>
      </div>
    `}_renderTimelinePreview(){return"schedule"===this._mode?this._renderScheduleTimeline():"solar"===this._mode?this._renderSolarTimeline():N``}_renderScheduleTimeline(){if(this._scheduleSteps.length<2)return N``;const e=this._scheduleSteps.map(e=>({minutes:this._resolveTimeMinutes(e.time),color_temp:e.color_temp,brightness:e.brightness,label:e.label})).filter(e=>null!==e.minutes).sort((e,t)=>e.minutes-t.minutes);if(e.length<2)return N``;const t=e.map(e=>({pct:e.minutes/1440*100,color_temp:e.color_temp,brightness:e.brightness,tooltip:`${e.label||""} (${Math.floor(e.minutes/60)}:${String(e.minutes%60).padStart(2,"0")})`.trim(),label:e.label,shortLabel:e.label?e.label[0]:""})),i=this._getSunTimes(),s=[{pct:i.sunrise/1440*100,icon:"mdi:weather-sunset-up",title:this._localize("editors.timeline_sunrise")},{pct:i.sunset/1440*100,icon:"mdi:weather-sunset-down",title:this._localize("editors.timeline_sunset")}],o=[0,3,6,9,12,15,18,21].map(e=>({pct:e/24*100,text:String(e).padStart(2,"0")}));return this._renderDualTrackBar({points:t,markers:s,axisLabels:o,wrapGradient:!0})}_estimateMaxElevation(){const e=this.hass?.states?.["sun.sun"];if(!e)return 55;const t=e.attributes.elevation;if(null==t||t<=0)return 55;const i=this._getSunTimes(),s=i.sunset-i.sunrise;if(s<=0)return 55;const o=new Date,a=(60*o.getHours()+o.getMinutes()-i.sunrise)/s;if(a<=.05||a>=.95)return 55;const n=Math.sin(Math.PI*a);if(n<.1)return 55;const r=t/n;return Math.max(30,Math.min(90,r))}_elevationToMinutes(e,t,i,s,o){const a=o-s,n=s+a/2;if(e<=0){const i=2*Math.abs(e);return"setting"===t?o+i:s-i}const r=Math.min(e/i,1),l=a*(Math.asin(r)/Math.PI);if("setting"===t)return o-l;if("rising"===t)return s+l;const c=s+l,d=o-l;return Math.abs(c-n)<Math.abs(d-n)?c:d}_renderSolarTimeline(){if(0===this._solarSteps.length)return N``;const e=this._getSunTimes(),t=this._estimateMaxElevation(),i=this._solarSteps.map(i=>({minutes:this._elevationToMinutes(i.sun_elevation,i.phase,t,e.sunrise,e.sunset),color_temp:i.color_temp,brightness:i.brightness,elevation:i.sun_elevation,phase:i.phase}));i.sort((e,t)=>e.minutes-t.minutes);const s=i.map(e=>({pct:Math.max(0,Math.min(1440,e.minutes))/1440*100,color_temp:e.color_temp,brightness:e.brightness,tooltip:`${e.elevation}° ${e.phase} (~${Math.floor(Math.max(0,e.minutes)/60)}:${String(Math.floor(Math.max(0,e.minutes)%60)).padStart(2,"0")})`,label:`${e.elevation}°`})),o=[{pct:e.sunrise/1440*100,icon:"mdi:weather-sunset-up",title:this._localize("editors.timeline_sunrise")},{pct:e.sunset/1440*100,icon:"mdi:weather-sunset-down",title:this._localize("editors.timeline_sunset")}],a=[0,3,6,9,12,15,18,21].map(e=>({pct:e/24*100,text:String(e).padStart(2,"0")}));return this._renderDualTrackBar({points:s,markers:o,axisLabels:a,wrapGradient:!1})}_renderScheduleStep(e,t){return N`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(t)}
          <span class="step-number">${e.label||this._localize("editors.step_label",{number:String(t+1)})}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${()=>this._moveScheduleStepUp(t)}
              .disabled=${0===t}
              title="${this._localize("tooltips.step_move_up")}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._moveScheduleStepDown(t)}
              .disabled=${t===this._scheduleSteps.length-1}
              title="${this._localize("tooltips.step_move_down")}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._duplicateScheduleStep(e)}
              .disabled=${this._scheduleSteps.length>=20}
              title="${this._localize("tooltips.step_duplicate")}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${()=>this._removeScheduleStep(e.id)}
              .disabled=${this._scheduleSteps.length<=2}
              title="${this._localize("tooltips.step_remove")}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.schedule_label")}</span>
            ${Qe({value:e.label,onChange:t=>{const i=t.target;this._scheduleSteps=this._scheduleSteps.map(t=>t.id===e.id?{...t,label:i.value}:t),this._hasUserInteraction=!0}})}
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.schedule_time")}</span>
            ${Qe({value:e.time,hint:this._localize("editors.schedule_time_hint"),onChange:t=>{const i=t.target;this._scheduleSteps=this._scheduleSteps.map(t=>t.id===e.id?{...t,time:i.value.trim()}:t),this._hasUserInteraction=!0}})}
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.color_temperature_label",{value:e.color_temp.toString()})}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{color_temp:{unit:"kelvin",min:2700,max:6500}}}
              .value=${e.color_temp}
              @value-changed=${t=>this._handleScheduleStepColorTempChange(e.id,t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.brightness_percent_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
              .value=${e.brightness}
              @value-changed=${t=>{this._scheduleSteps=this._scheduleSteps.map(i=>i.id===e.id?{...i,brightness:t.detail.value}:i),this._hasUserInteraction=!0}}
            ></ha-selector>
          </div>
        </div>
      </div>
    `}_renderSolarStep(e,t){return N`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(t)}
          <span class="step-number">Step ${t+1}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${()=>this._moveSolarStepUp(t)}
              .disabled=${0===t}
              title="${this._localize("tooltips.step_move_up")}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._moveSolarStepDown(t)}
              .disabled=${t===this._solarSteps.length-1}
              title="${this._localize("tooltips.step_move_down")}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._duplicateSolarStep(e)}
              .disabled=${this._solarSteps.length>=20}
              title="${this._localize("tooltips.step_duplicate")}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${()=>this._removeSolarStep(e.id)}
              .disabled=${this._solarSteps.length<=1}
              title="${this._localize("tooltips.step_remove")}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.sun_elevation_label",{value:e.sun_elevation.toString()})}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:-10,max:90,step:1,mode:"slider",unit_of_measurement:"°"}}}
              .value=${e.sun_elevation}
              @value-changed=${t=>this._handleSolarStepFieldChange(e.id,"sun_elevation",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.phase_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._phaseOptions,mode:"dropdown"}}}
              .value=${e.phase}
              @value-changed=${t=>this._handleSolarStepFieldChange(e.id,"phase",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.color_temperature_label",{value:e.color_temp.toString()})}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{color_temp:{unit:"kelvin",min:2700,max:6500}}}
              .value=${e.color_temp}
              @value-changed=${t=>this._handleSolarStepColorTempChange(e.id,t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.brightness_percent_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
              .value=${e.brightness}
              @value-changed=${t=>this._handleSolarStepFieldChange(e.id,"brightness",t)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `}_renderStep(e,t){return N`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(t)}
          <span class="step-number">Step ${t+1}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${()=>this._moveStepUp(t)}
              .disabled=${0===t}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_move_up")}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._moveStepDown(t)}
              .disabled=${t===this._steps.length-1}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_move_down")}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._duplicateStep(e)}
              .disabled=${this._steps.length>=20}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_duplicate")}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${()=>this._removeStep(e.id)}
              .disabled=${this._steps.length<=1}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_remove")}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.color_temperature_label",{value:e.color_temp.toString()})}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{color_temp:{unit:"kelvin",min:2700,max:6500}}}
              .value=${e.color_temp}
              @value-changed=${t=>this._handleStepColorTempChange(e.id,t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.brightness_percent_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
              .value=${e.brightness}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"brightness",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.transition_time_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:3600,step:.5,mode:"box",unit_of_measurement:"s"}}}
              .value=${e.transition}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"transition",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.hold_time_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:43200,step:1,mode:"box",unit_of_measurement:"s"}}}
              .value=${e.hold}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"hold",t)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `}_hasAnySteps(){return"standard"===this._mode?this._steps.length>0:"schedule"===this._mode?this._scheduleSteps.length>0:this._solarSteps.length>0}_localize(e,t){return it(this.translations,e,t)}render(){return N`
      <div class="editor-content">
        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.name_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{text:{}}}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.icon_label")}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{icon:{}}}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon?N`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${()=>{this._icon="",this._hasUserInteraction=!0}}
                  title=${this._localize("editors.icon_clear_tooltip")}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              `:""}
            </div>
            <span class="form-hint">${this._localize("editors.icon_auto_hint")}</span>
          </div>
        </div>

        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.mode_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._modeOptions,mode:"dropdown"}}}
              .value=${this._mode}
              @value-changed=${this._handleModeChange}
            ></ha-selector>
            <span class="form-hint">${this._localize("editors.adaptive_mode_hint")}</span>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.auto_resume_delay_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:3600,step:1,unit_of_measurement:"s",mode:"box"}}}
              .value=${this._autoResumeDelay}
              .disabled=${"standard"===this._mode}
              @value-changed=${this._handleAutoResumeDelayChange}
            ></ha-selector>
            <span class="form-hint">${this._localize("editors.auto_resume_delay_hint")}</span>
          </div>
        </div>

        <div class="form-row-pair">
            <div class="form-field">
              <span class="form-label">${this._localize("editors.loop_mode_label")}</span>
              <ha-selector
                .hass=${this.hass}
                .selector=${{select:{options:this._loopModeOptions,mode:"dropdown"}}}
                .value=${"standard"!==this._mode?"continuous":this._loopMode}
                .disabled=${"standard"!==this._mode}
                @value-changed=${this._handleLoopModeChange}
              ></ha-selector>
            </div>
            <div class="form-field">
              <span class="form-label">${this._localize("editors.end_behavior_label")}</span>
              <ha-selector
                .hass=${this.hass}
                .selector=${{select:{options:this._endBehaviorOptions,mode:"dropdown"}}}
                .value=${"standard"!==this._mode?"maintain":this._endBehavior}
                .disabled=${"standard"!==this._mode}
                @value-changed=${this._handleEndBehaviorChange}
              ></ha-selector>
            </div>
          </div>

          ${"standard"===this._mode&&"count"===this._loopMode?N`
                <div class="form-row">
                  <span class="form-label">${this._localize("editors.loop_count_label")}</span>
                  <div class="form-input">
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{number:{min:1,max:100,mode:"box"}}}
                      .value=${this._loopCount}
                      @value-changed=${this._handleLoopCountChange}
                    ></ha-selector>
                  </div>
                </div>
              `:""}

          <div class="form-section toggle-row">
            <div class="toggle-item">
              <span class="toggle-label">${this._localize("editors.skip_first_step_label")}</span>
              <ha-switch
                .checked=${this._skipFirstInLoop}
                .disabled=${"standard"!==this._mode}
                @change=${this._handleSkipFirstInLoopChange}
              ></ha-switch>
            </div>
          </div>

          ${"standard"===this._mode?N`
          <div class="form-section">
            <span class="form-label">${this._localize("editors.steps_label")}</span>
            <div class="step-list">
              ${0===this._steps.length?N`
                    <div class="empty-steps">
                      ${this._localize("editors.no_steps_message")}
                    </div>
                  `:this._steps.map((e,t)=>N`
                    ${this._renderDropIndicator(t)}
                    ${this._renderStep(e,t)}
                  `)}
              ${this._renderDropIndicator(this._steps.length)}

              <button
                class="add-step-btn ${this._steps.length>=20?"disabled":""}"
                @click=${this._addStep}
                ?disabled=${this._steps.length>=20}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize("editors.add_step_button")}
              </button>
            </div>
          </div>
          `:"schedule"===this._mode?N`
          ${this._renderTimelinePreview()}
          <div class="form-section">
            <span class="form-label">${this._localize("editors.schedule_steps_label")}</span>
            <div class="step-list">
              ${0===this._scheduleSteps.length?N`
                    <div class="empty-steps">
                      ${this._localize("editors.no_steps_message")}
                    </div>
                  `:this._scheduleSteps.map((e,t)=>N`
                    ${this._renderDropIndicator(t)}
                    ${this._renderScheduleStep(e,t)}
                  `)}
              ${this._renderDropIndicator(this._scheduleSteps.length)}

              <button
                class="add-step-btn ${this._scheduleSteps.length>=20?"disabled":""}"
                @click=${this._addScheduleStep}
                ?disabled=${this._scheduleSteps.length>=20}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize("editors.add_step_button")}
              </button>
            </div>
          </div>
          `:N`
          ${this._renderTimelinePreview()}
          <div class="form-section">
            <span class="form-label">${this._localize("editors.solar_steps_label")}</span>
            <div class="step-list">
              ${0===this._solarSteps.length?N`
                    <div class="empty-steps">
                      ${this._localize("editors.no_steps_message")}
                    </div>
                  `:this._solarSteps.map((e,t)=>N`
                    ${this._renderDropIndicator(t)}
                    ${this._renderSolarStep(e,t)}
                  `)}
              ${this._renderDropIndicator(this._solarSteps.length)}

              <button
                class="add-step-btn ${this._solarSteps.length>=20?"disabled":""}"
                @click=${this._addSolarStep}
                ?disabled=${this._solarSteps.length>=20}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize("editors.add_step_button")}
              </button>
            </div>
          </div>
          `}

        ${this._hasIncompatibleEndpoints()?N`
              <div class="error-warning">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <span>${this._localize("editors.incompatible_cct_endpoints")}</span>
              </div>
            `:""}

        ${this.hasSelectedEntities?"":N`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize("editors.select_lights_for_preview_sequences")}</span>
              </div>
            `}

        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize("editors.cancel_button")}</ha-button>
            ${this._hasUserInteraction?N`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize("editors.unsaved_changes")}
              </span>
            `:""}
          </div>
          ${this.previewActive?N`
                <ha-button @click=${this._stopPreview}>
                  <ha-icon icon="mdi:stop"></ha-icon>
                  <span class="btn-text">${this._localize("editors.stop_button")}</span>
                </ha-button>
              `:N`
                <ha-button
                  @click=${this._preview}
                  .disabled=${this._previewing||!this._hasAnySteps()||!this.hasSelectedEntities||!this.isCompatible||this._hasIncompatibleEndpoints()}
                  title=${this.hasSelectedEntities?this.isCompatible?this._hasIncompatibleEndpoints()?this._localize("editors.tooltip_light_no_cct"):"":this._localize("editors.tooltip_light_not_compatible"):this._localize("editors.tooltip_select_lights_first")}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize("editors.preview_button")}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim()||!this._hasAnySteps()||this._saving}
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode?this._localize("editors.update_button"):this._localize("editors.save_button")}</span>
          </ha-button>
        </div>
      </div>
    `}};ci.styles=[vt,at,n`
    .step-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .step-item {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
    }

    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .step-number {
      flex: 1;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-color);
    }

    .step-actions {
      display: flex;
      gap: 4px;
    }

    .step-actions ha-icon-button {
      --ha-icon-button-size: 32px;
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 18px;
    }

    .step-actions .step-delete {
      color: var(--secondary-text-color);
      transition: color 0.2s ease;
    }

    .step-actions .step-delete:hover:not([disabled]) {
      color: var(--error-color);
    }

    .step-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
    }

    .step-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .step-field-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .add-step-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      background: transparent;
    }

    .add-step-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .add-step-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      border-left: 4px solid var(--error-color, #db4437);
      border-radius: 4px;
      font-size: 13px;
    }

    .error-warning ha-icon {
      flex-shrink: 0;
      --mdc-icon-size: 18px;
    }

    .empty-steps {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
      background: var(--card-background-color);
      border-radius: 8px;
      border: 2px dashed var(--divider-color);
    }

    @media (max-width: 600px) {
      .step-fields {
        grid-template-columns: 1fr;
      }
    }

    .form-section.toggle-row {
      flex-direction: row;
      gap: 24px;
      flex-wrap: wrap;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }

    .timeline-preview {
      margin-bottom: 16px;
    }

    .timeline-bar-container {
      position: relative;
      padding-left: 28px;
    }

    .timeline-bar {
      position: relative;
      height: 24px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
    }

    .timeline-ct {
      border-radius: 4px 4px 0 0;
    }

    .timeline-br {
      border-radius: 0 0 4px 4px;
      height: 12px;
      border-top: none;
    }

    .timeline-track-labels {
      position: absolute;
      left: 0;
      top: 0;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .timeline-track-label {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
    }

    .timeline-track-label:first-child {
      height: 24px;
    }

    .timeline-track-label:last-child {
      height: 12px;
    }

    .track-icon {
      --mdc-icon-size: 14px;
      color: var(--secondary-text-color);
    }

    .timeline-marker {
      position: absolute;
      top: 0;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    .timeline-marker .marker-line {
      position: absolute;
      top: 0;
      left: 0;
      width: 1px;
      height: 100%;
      background: var(--primary-text-color);
      opacity: 0.4;
    }

    .timeline-marker .marker-icon {
      position: absolute;
      top: -20px;
      left: -10px;
      --mdc-icon-size: 16px;
      color: var(--secondary-text-color);
    }

    .timeline-step-dot {
      position: absolute;
      top: 50%;
      width: 8px;
      height: 8px;
      background: var(--primary-text-color);
      border: 2px solid var(--card-background-color);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
    }

    .timeline-br .timeline-step-dot {
      width: 6px;
      height: 6px;
    }

    .timeline-hours {
      position: relative;
      height: 18px;
      margin-top: 2px;
    }

    .timeline-hours .timeline-hour {
      position: absolute;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--secondary-text-color);
    }

    .timeline-labels {
      position: relative;
      height: 18px;
      margin-top: 2px;
      margin-left: 28px;
    }

    .timeline-labels .timeline-label {
      position: absolute;
      transform: translateX(-50%);
      font-size: 10px;
      color: var(--primary-text-color);
      white-space: nowrap;
    }

    .timeline-label .short-label {
      display: none;
    }

    @media (max-width: 600px) {
      .timeline-label .full-label {
        display: none;
      }
      .timeline-label .short-label {
        display: inline;
      }
    }
  `],e([pe({attribute:!1})],ci.prototype,"hass",void 0),e([pe({type:Object})],ci.prototype,"preset",void 0),e([pe({type:Object})],ci.prototype,"translations",void 0),e([pe({type:Boolean})],ci.prototype,"editMode",void 0),e([pe({type:Boolean})],ci.prototype,"hasSelectedEntities",void 0),e([pe({type:Boolean})],ci.prototype,"isCompatible",void 0),e([pe({type:Array})],ci.prototype,"selectedEntities",void 0),e([pe({type:Boolean})],ci.prototype,"previewActive",void 0),e([pe({type:Object})],ci.prototype,"deviceContext",void 0),e([pe({type:Object})],ci.prototype,"draft",void 0),e([_e()],ci.prototype,"_name",void 0),e([_e()],ci.prototype,"_icon",void 0),e([_e()],ci.prototype,"_steps",void 0),e([_e()],ci.prototype,"_loopMode",void 0),e([_e()],ci.prototype,"_loopCount",void 0),e([_e()],ci.prototype,"_endBehavior",void 0),e([_e()],ci.prototype,"_skipFirstInLoop",void 0),e([_e()],ci.prototype,"_mode",void 0),e([_e()],ci.prototype,"_autoResumeDelay",void 0),e([_e()],ci.prototype,"_solarSteps",void 0),e([_e()],ci.prototype,"_scheduleSteps",void 0),e([_e()],ci.prototype,"_saving",void 0),e([_e()],ci.prototype,"_previewing",void 0),e([_e()],ci.prototype,"_hasUserInteraction",void 0),ci=e([ce("cct-sequence-editor")],ci);let di=class extends(mt(re)){constructor(){super(...arguments),this.translations={},this.editMode=!1,this.hasSelectedEntities=!1,this.isCompatible=!0,this.previewActive=!1,this.stripSegmentCount=10,this.colorHistory=[],this._name="",this._icon="",this._deviceType="t1m",this._steps=[],this._loopMode="once",this._loopCount=3,this._endBehavior="maintain",this._clearSegments=!1,this._skipFirstInLoop=!1,this._saving=!1,this._previewing=!1,this._hasUserInteraction=!1,this._cachedLoopModeOptions=[],this._cachedEndBehaviorOptions=[],this._cachedActivationPatternOptions=[]}willUpdate(e){if(e.has("translations")){const e=e=>this._localize(e);this._cachedLoopModeOptions=st(e),this._cachedEndBehaviorOptions=ot(e),this._cachedActivationPatternOptions=[{value:"all",label:e("options.activation_all")},{value:"sequential_forward",label:e("options.activation_sequential_forward")},{value:"sequential_reverse",label:e("options.activation_sequential_reverse")},{value:"random",label:e("options.activation_random")},{value:"ping_pong",label:e("options.activation_ping_pong")},{value:"center_out",label:e("options.activation_center_out")},{value:"edges_in",label:e("options.activation_edges_in")},{value:"paired",label:e("options.activation_paired")}]}}get _loopModeOptions(){return this._cachedLoopModeOptions}get _endBehaviorOptions(){return this._cachedEndBehaviorOptions}get _activationPatternOptions(){return this._cachedActivationPatternOptions}connectedCallback(){super.connectedCallback(),0!==this._steps.length||this.preset||this._addDefaultStep()}updated(e){super.updated(e),e.has("draft")&&this.draft?this._restoreDraft(this.draft):e.has("preset")&&(this.preset?(this._hasUserInteraction=!0,this._loadPreset(this.preset)):this._hasUserInteraction=!1),e.has("deviceContext")&&!this._hasUserInteraction&&this.deviceContext?.deviceType&&(this._deviceType=this.deviceContext.deviceType)}_getCurrentSegmentCount(){switch(this._deviceType){case"t1":return 20;case"t1m":default:return 26;case"t1_strip":return this.stripSegmentCount}}_loadPreset(e){this._name=e.name,this._icon=e.icon||"",this._deviceType=e.device_type||"t1m",this._loopMode=e.loop_mode,this._loopCount=e.loop_count||3,this._endBehavior=e.end_behavior,this._clearSegments=e.clear_segments||!1,this._skipFirstInLoop=e.skip_first_in_loop||!1,this._steps=e.steps.map((e,t)=>{const i=e.colors.map(e=>{const t={r:e[0]??0,g:e[1]??0,b:e[2]??0};return Re(t.r,t.g,t.b)});let s="individual";"gradient"===e.mode?s="gradient":"blocks_expand"===e.mode||"blocks_repeat"===e.mode?s="blocks":"individual"===e.mode&&(s="individual");const o=new Map;if(e.segment_colors&&Array.isArray(e.segment_colors))for(const t of e.segment_colors){const e="number"==typeof t.segment?t.segment:parseInt(t.segment,10),i=t.color;if("r"in i&&"g"in i&&"b"in i){if(0===i.r&&0===i.g&&0===i.b)continue;o.set(e-1,Re(i.r,i.g,i.b))}}return{...e,id:`step-${t}-${Date.now()}`,coloredSegments:o,colorPalette:[...Ye],gradientColors:i.length>=2?i:[...Xe],blockColors:i.length>=1?i:[...Ke],expandBlocks:"blocks_expand"===e.mode,patternMode:s,gradientMirror:!1,gradientRepeat:1,gradientReverse:!1,gradientInterpolation:"shortest",gradientWave:!1,gradientWaveCycles:1,turnOffUnspecified:!0}})}getDraftState(){return{name:this._name,icon:this._icon,deviceType:this._deviceType,steps:this._steps.map(e=>({id:e.id,duration:e.duration,hold:e.hold,activation_pattern:e.activation_pattern,transition:e.transition,coloredSegments:Array.from(e.coloredSegments.entries()),colorPalette:[...e.colorPalette],gradientColors:[...e.gradientColors],blockColors:[...e.blockColors],expandBlocks:e.expandBlocks,patternMode:e.patternMode,gradientMirror:e.gradientMirror,gradientRepeat:e.gradientRepeat,gradientReverse:e.gradientReverse,gradientInterpolation:e.gradientInterpolation,gradientWave:e.gradientWave,gradientWaveCycles:e.gradientWaveCycles,turnOffUnspecified:e.turnOffUnspecified})),loopMode:this._loopMode,loopCount:this._loopCount,endBehavior:this._endBehavior,clearSegments:this._clearSegments,skipFirstInLoop:this._skipFirstInLoop,hasUserInteraction:this._hasUserInteraction}}resetToDefaults(){this._name="",this._icon="",this._deviceType="t1m",this._loopMode="once",this._loopCount=3,this._endBehavior="maintain",this._clearSegments=!1,this._skipFirstInLoop=!1,this._hasUserInteraction=!1,this._addDefaultStep()}_restoreDraft(e){this._name=e.name,this._icon=e.icon,this._deviceType=e.deviceType,this._loopMode=e.loopMode,this._loopCount=e.loopCount,this._endBehavior=e.endBehavior,this._clearSegments=e.clearSegments,this._skipFirstInLoop=e.skipFirstInLoop,this._steps=e.steps.map(e=>({segments:"all",colors:[[255,0,0]],mode:"gradient"===e.patternMode?"gradient":e.expandBlocks?"blocks_expand":"blocks_repeat",duration:e.duration,hold:e.hold,activation_pattern:e.activation_pattern,transition:e.transition,id:e.id,coloredSegments:new Map(e.coloredSegments),colorPalette:[...e.colorPalette],gradientColors:[...e.gradientColors],blockColors:[...e.blockColors],expandBlocks:e.expandBlocks,patternMode:e.patternMode,gradientMirror:e.gradientMirror,gradientRepeat:e.gradientRepeat,gradientReverse:e.gradientReverse,gradientInterpolation:e.gradientInterpolation,gradientWave:e.gradientWave,gradientWaveCycles:e.gradientWaveCycles,turnOffUnspecified:e.turnOffUnspecified})),this._hasUserInteraction=e.hasUserInteraction??!1}_addDefaultStep(){this._steps=[{id:`step-0-${Date.now()}`,segments:"all",colors:[[255,0,0]],mode:"blocks_expand",duration:15,hold:60,activation_pattern:"all",coloredSegments:new Map,colorPalette:[...Ye],gradientColors:[...Xe],blockColors:[...Ke],expandBlocks:!1,patternMode:"individual",gradientMirror:!1,gradientRepeat:1,gradientReverse:!1,gradientInterpolation:"shortest",gradientWave:!1,gradientWaveCycles:1,turnOffUnspecified:!0}]}_generateStepId(){return`step-${this._steps.length}-${Date.now()}`}_handleNameChange(e){this._name=e.detail.value||"",this._hasUserInteraction=!0}_handleIconChange(e){this._icon=e.detail.value||"",this._hasUserInteraction=!0}_handleDeviceTypeChange(e){this._deviceType=e.detail.value||"t1m",this._hasUserInteraction=!0}_handleLoopModeChange(e){this._loopMode=e.detail.value||"once",this._hasUserInteraction=!0}_handleLoopCountChange(e){this._loopCount=e.detail.value??3,this._hasUserInteraction=!0}_handleEndBehaviorChange(e){this._endBehavior=e.detail.value||"maintain",this._hasUserInteraction=!0}_handleClearSegmentsChange(e){this._clearSegments=e.target.checked,this._hasUserInteraction=!0}_handleSkipFirstInLoopChange(e){this._skipFirstInLoop=e.target.checked,this._hasUserInteraction=!0}_hasInvalidGradientSteps(){return this._steps.some(e=>"gradient"===e.patternMode&&e.gradientColors.length<2)}_handleStepFieldChange(e,t,i){this._steps=this._steps.map(s=>s.id===e?{...s,[t]:i.detail.value}:s),this._hasUserInteraction=!0}_handleStepColorValueChange(e,t){const{value:i}=t.detail;this._steps=this._steps.map(t=>{if(t.id!==e)return t;if(i instanceof Map){const e=Array.from(i.keys()).sort((e,t)=>e-t),s=e.length>0?e.map(e=>e+1).join(","):"all";return{...t,coloredSegments:i,segments:s}}return t}),this._hasUserInteraction=!0}_handleStepGradientColorsChange(e,t){const{colors:i}=t.detail;Array.isArray(i)&&(this._steps=this._steps.map(t=>t.id===e?{...t,gradientColors:i}:t),this._hasUserInteraction=!0)}_handleStepBlockColorsChange(e,t){const{colors:i}=t.detail;Array.isArray(i)&&(this._steps=this._steps.map(t=>t.id===e?{...t,blockColors:i}:t),this._hasUserInteraction=!0)}_handleStepColorPaletteChange(e,t){const{colors:i}=t.detail;Array.isArray(i)&&(this._steps=this._steps.map(t=>t.id===e?{...t,colorPalette:i}:t),this._hasUserInteraction=!0)}_handleStepTurnOffUnspecifiedChange(e,t){this._steps=this._steps.map(i=>i.id===e?{...i,turnOffUnspecified:t.detail.value}:i),this._hasUserInteraction=!0}_addStep(){if(this._steps.length>=20)return;const e=this._steps[this._steps.length-1],t={id:this._generateStepId(),segments:e?.segments||"all",colors:e?.colors?.map(e=>Array.isArray(e)?[...e]:e)||[[255,0,0]],mode:e?.mode||"blocks_expand",duration:e?.duration??15,hold:e?.hold??60,activation_pattern:e?.activation_pattern??"all",coloredSegments:e?new Map(e.coloredSegments):new Map,colorPalette:e?e.colorPalette.map(e=>({...e})):[...Ye],gradientColors:e?e.gradientColors.map(e=>({...e})):[...Xe],blockColors:e?e.blockColors.map(e=>({...e})):[...Ke],expandBlocks:e?.expandBlocks||!1,patternMode:e?.patternMode||"individual",gradientMirror:e?.gradientMirror||!1,gradientRepeat:e?.gradientRepeat||1,gradientReverse:e?.gradientReverse||!1,gradientInterpolation:e?.gradientInterpolation||"shortest",gradientWave:e?.gradientWave||!1,gradientWaveCycles:e?.gradientWaveCycles||1,turnOffUnspecified:e?.turnOffUnspecified??!0};this._steps=[...this._steps,t],this._hasUserInteraction=!0}_removeStep(e){this._steps.length<=1||(this._steps=this._steps.filter(t=>t.id!==e),this._hasUserInteraction=!0)}_moveStepUp(e){if(e<=0)return;const t=[...this._steps],i=t[e-1];t[e-1]=t[e],t[e]=i,this._steps=t,this._hasUserInteraction=!0}_moveStepDown(e){if(e>=this._steps.length-1)return;const t=[...this._steps],i=t[e];t[e]=t[e+1],t[e+1]=i,this._steps=t,this._hasUserInteraction=!0}_duplicateStep(e){if(this._steps.length>=20)return;const t={...e,id:this._generateStepId(),colors:e.colors?.map(e=>Array.isArray(e)?[...e]:e)||[[255,0,0]],coloredSegments:new Map(e.coloredSegments),colorPalette:e.colorPalette.map(e=>({...e})),gradientColors:e.gradientColors.map(e=>({...e})),blockColors:e.blockColors.map(e=>({...e}))},i=this._steps.findIndex(t=>t.id===e.id),s=[...this._steps];s.splice(i+1,0,t),this._steps=s,this._hasUserInteraction=!0}_getPresetData(){const e=this._getCurrentSegmentCount(),t=this._steps.map(({id:t,coloredSegments:i,colorPalette:s,gradientColors:o,blockColors:a,expandBlocks:n,patternMode:r,gradientMirror:l,gradientRepeat:c,gradientReverse:d,gradientInterpolation:h,gradientWave:p,gradientWaveCycles:_,turnOffUnspecified:u,...g})=>{const v=[],m=new Set;for(const[e,t]of i){const i=Ue(t.x,t.y,255);v.push({segment:e+1,color:{r:i.r,g:i.g,b:i.b}}),m.add(e+1)}if(u)for(let t=1;t<=e;t++)m.has(t)||v.push({segment:t,color:{r:0,g:0,b:0}});return{...g,segment_colors:v}}),i={name:this._name,icon:this._icon||void 0,device_type:this._deviceType,steps:t,loop_mode:this._loopMode,end_behavior:this._endBehavior,clear_segments:this._clearSegments,skip_first_in_loop:this._skipFirstInLoop};return"count"===this._loopMode&&(i.loop_count=this._loopCount),i}async _preview(){if(this.hass&&!this._previewing){this._previewing=!0;try{this.dispatchEvent(new CustomEvent("preview",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._previewing=!1}}}_stopPreview(){this.dispatchEvent(new CustomEvent("stop-preview",{bubbles:!0,composed:!0}))}async _save(){if(this._name.trim()&&0!==this._steps.length){this._saving=!0;try{this.dispatchEvent(new CustomEvent("save",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._saving=!1}}}_cancel(){this._hasUserInteraction=!1,this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_renderStep(e,t){return N`
      <div class="step-item">
        <div class="step-header">
          ${this._renderDragHandle(t)}
          <span class="step-number">Step ${t+1}</span>
          <div class="step-actions">
            <ha-icon-button
              @click=${()=>this._moveStepUp(t)}
              .disabled=${0===t}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_move_up")}"
            >
              <ha-icon icon="mdi:arrow-up"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._moveStepDown(t)}
              .disabled=${t===this._steps.length-1}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_move_down")}"
            >
              <ha-icon icon="mdi:arrow-down"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              @click=${()=>this._duplicateStep(e)}
              .disabled=${this._steps.length>=20}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_duplicate")}"
            >
              <ha-icon icon="mdi:content-copy"></ha-icon>
            </ha-icon-button>
            <ha-icon-button
              class="step-delete"
              @click=${()=>this._removeStep(e.id)}
              .disabled=${this._steps.length<=1}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.step_remove")}"
            >
              <ha-icon icon="mdi:delete"></ha-icon>
            </ha-icon-button>
          </div>
        </div>
        <div class="step-segment-selector">
          <segment-selector
            .hass=${this.hass}
            .mode=${"color"}
            .maxSegments=${this._getCurrentSegmentCount()}
            .colorValue=${e.coloredSegments}
            .colorPalette=${e.colorPalette}
            .gradientColors=${e.gradientColors}
            .blockColors=${e.blockColors}
            .expandBlocks=${e.expandBlocks}
            .gradientMirror=${e.gradientMirror}
            .gradientRepeat=${e.gradientRepeat}
            .gradientReverse=${e.gradientReverse}
            .gradientInterpolation=${e.gradientInterpolation}
            .gradientWave=${e.gradientWave}
            .gradientWaveCycles=${e.gradientWaveCycles}
            .initialPatternMode=${e.patternMode}
            .label=${this._localize("editors.segment_grid_label")}
            .translations=${this.translations}
            .colorHistory=${this.colorHistory}
            .zones=${this.deviceContext?.zones||[]}
            .turnOffUnspecified=${e.turnOffUnspecified}
            @color-value-changed=${t=>this._handleStepColorValueChange(e.id,t)}
            @color-palette-changed=${t=>this._handleStepColorPaletteChange(e.id,t)}
            @gradient-colors-changed=${t=>this._handleStepGradientColorsChange(e.id,t)}
            @block-colors-changed=${t=>this._handleStepBlockColorsChange(e.id,t)}
            @turn-off-unspecified-changed=${t=>this._handleStepTurnOffUnspecifiedChange(e.id,t)}
          ></segment-selector>
        </div>
        <div class="step-fields">
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.activation_pattern_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._activationPatternOptions,mode:"dropdown"}}}
              .value=${e.activation_pattern}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"activation_pattern",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.duration_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:3600,step:.5,mode:"box",unit_of_measurement:"s"}}}
              .value=${e.duration}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"duration",t)}
            ></ha-selector>
          </div>
          <div class="step-field">
            <span class="step-field-label">${this._localize("editors.hold_time_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:43200,step:1,mode:"box",unit_of_measurement:"s"}}}
              .value=${e.hold}
              @value-changed=${t=>this._handleStepFieldChange(e.id,"hold",t)}
            ></ha-selector>
          </div>
        </div>
      </div>
    `}_localize(e,t){return it(this.translations,e,t)}render(){const e=Object.entries(et).map(([e,t])=>({value:e,label:t}));return N`
      <div class="editor-content">
        <div class="form-row-triple">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.name_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{text:{}}}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.icon_label")}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{icon:{}}}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon?N`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${()=>{this._icon="",this._hasUserInteraction=!0}}
                  title=${this._localize("editors.icon_clear_tooltip")}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              `:""}
            </div>
            <span class="form-hint">${this._localize("editors.icon_auto_hint")}</span>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.device_type_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:e,mode:"dropdown"}}}
              .value=${this._deviceType}
              @value-changed=${this._handleDeviceTypeChange}
            ></ha-selector>
          </div>
        </div>

        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.loop_mode_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._loopModeOptions,mode:"dropdown"}}}
              .value=${this._loopMode}
              @value-changed=${this._handleLoopModeChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.end_behavior_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._endBehaviorOptions,mode:"dropdown"}}}
              .value=${this._endBehavior}
              @value-changed=${this._handleEndBehaviorChange}
            ></ha-selector>
          </div>
        </div>

        ${"count"===this._loopMode?N`
              <div class="form-row">
                <span class="form-label">${this._localize("editors.loop_count_label")}</span>
                <div class="form-input">
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{number:{min:1,max:100,mode:"box"}}}
                    .value=${this._loopCount}
                    @value-changed=${this._handleLoopCountChange}
                  ></ha-selector>
                </div>
              </div>
            `:""}

        <div class="form-section toggle-row">
          <div class="toggle-item">
            <span class="toggle-label">${this._localize("editors.clear_segments_label")}</span>
            <ha-switch
              .checked=${this._clearSegments}
              @change=${this._handleClearSegmentsChange}
            ></ha-switch>
          </div>
          <div class="toggle-item">
            <span class="toggle-label">${this._localize("editors.skip_first_step_label")}</span>
            <ha-switch
              .checked=${this._skipFirstInLoop}
              @change=${this._handleSkipFirstInLoopChange}
            ></ha-switch>
          </div>
        </div>

        <div class="form-section">
          <span class="form-label">${this._localize("editors.steps_label")}</span>
          <div class="step-list">
            ${0===this._steps.length?N`
                  <div class="empty-steps">
                    ${this._localize("editors.no_steps_message")}
                  </div>
                `:this._steps.map((e,t)=>N`
                  ${this._renderDropIndicator(t)}
                  ${this._renderStep(e,t)}
                `)}
            ${this._renderDropIndicator(this._steps.length)}

            <button
              class="add-step-btn ${this._steps.length>=20?"disabled":""}"
              @click=${this._addStep}
              ?disabled=${this._steps.length>=20}
            >
              <ha-icon icon="mdi:plus"></ha-icon>
              ${this._localize("editors.add_step_button")}
            </button>
          </div>
        </div>

        ${this._hasInvalidGradientSteps()?N`
              <div class="error-warning">
                <ha-icon icon="mdi:alert-circle"></ha-icon>
                <span>${this._localize("editors.gradient_min_colors_error")}</span>
              </div>
            `:""}

        ${this.hasSelectedEntities?"":N`
              <div class="preview-warning">
                <ha-icon icon="mdi:information"></ha-icon>
                <span>${this._localize("editors.select_lights_for_preview_sequences")}</span>
              </div>
            `}

        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize("editors.cancel_button")}</ha-button>
            ${this._hasUserInteraction?N`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize("editors.unsaved_changes")}
              </span>
            `:""}
          </div>
          ${this.previewActive?N`
                <ha-button @click=${this._stopPreview}>
                  <ha-icon icon="mdi:stop"></ha-icon>
                  <span class="btn-text">${this._localize("editors.stop_button")}</span>
                </ha-button>
              `:N`
                <ha-button
                  @click=${this._preview}
                  .disabled=${this._previewing||0===this._steps.length||!this.hasSelectedEntities||!this.isCompatible||this._hasInvalidGradientSteps()}
                  title=${this.hasSelectedEntities?this.isCompatible?this._hasInvalidGradientSteps()?this._localize("editors.tooltip_fix_gradient_errors"):"":this._localize("editors.tooltip_light_not_compatible"):this._localize("editors.tooltip_select_lights_first")}
                >
                  <ha-icon icon="mdi:play"></ha-icon>
                  <span class="btn-text">${this._localize("editors.preview_button")}</span>
                </ha-button>
              `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim()||0===this._steps.length||this._saving||this._hasInvalidGradientSteps()}
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode?this._localize("editors.update_button"):this._localize("editors.save_button")}</span>
          </ha-button>
        </div>
      </div>
    `}};di.styles=[Oe,vt,at,n`
    .form-section.toggle-row {
      flex-direction: row;
      gap: 24px;
      flex-wrap: wrap;
    }

    .toggle-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .toggle-label {
      font-size: 14px;
      color: var(--secondary-text-color);
    }

    .step-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .step-item {
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
      padding: 16px;
    }

    .step-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .step-number {
      flex: 1;
      font-weight: 600;
      font-size: 14px;
      color: var(--primary-color);
    }

    .step-actions {
      display: flex;
      gap: 4px;
    }

    .step-actions ha-icon-button {
      --ha-icon-button-size: 32px;
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 18px;
    }

    .step-actions .step-delete {
      color: var(--secondary-text-color);
      transition: color 0.2s ease;
    }

    .step-actions .step-delete:hover:not([disabled]) {
      color: var(--error-color);
    }

    .step-segment-selector {
      width: 100%;
      margin-bottom: 16px;
    }

    .step-fields {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 12px;
    }

    .step-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .step-field-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .step-field.full-width {
      grid-column: 1 / -1;
    }

    /* Color picker styles (color-picker-grid, color-item, color-swatch,
       color-picker-modal, color-remove, add-color-btn) are inherited
       from colorPickerStyles (styles.ts) */

    .add-step-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      background: transparent;
    }

    .add-step-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .add-step-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .error-warning {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      border: 1px solid var(--divider-color);
      border-left: 4px solid var(--error-color, #db4437);
      border-radius: 4px;
      font-size: 13px;
    }

    .error-warning ha-icon {
      flex-shrink: 0;
      --mdc-icon-size: 18px;
    }

    .empty-steps {
      text-align: center;
      padding: 40px 20px;
      color: var(--secondary-text-color);
      background: var(--card-background-color);
      border-radius: 8px;
      border: 2px dashed var(--divider-color);
    }

    @media (max-width: 600px) {
      .step-fields {
        grid-template-columns: 1fr;
      }
    }

    .form-hint {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      margin-top: -4px;
    }
  `],e([pe({attribute:!1})],di.prototype,"hass",void 0),e([pe({type:Object})],di.prototype,"preset",void 0),e([pe({type:Object})],di.prototype,"translations",void 0),e([pe({type:Boolean})],di.prototype,"editMode",void 0),e([pe({type:Boolean})],di.prototype,"hasSelectedEntities",void 0),e([pe({type:Boolean})],di.prototype,"isCompatible",void 0),e([pe({type:Boolean})],di.prototype,"previewActive",void 0),e([pe({type:Number})],di.prototype,"stripSegmentCount",void 0),e([pe({type:Object})],di.prototype,"deviceContext",void 0),e([pe({type:Array})],di.prototype,"colorHistory",void 0),e([pe({type:Object})],di.prototype,"draft",void 0),e([_e()],di.prototype,"_name",void 0),e([_e()],di.prototype,"_icon",void 0),e([_e()],di.prototype,"_deviceType",void 0),e([_e()],di.prototype,"_steps",void 0),e([_e()],di.prototype,"_loopMode",void 0),e([_e()],di.prototype,"_loopCount",void 0),e([_e()],di.prototype,"_endBehavior",void 0),e([_e()],di.prototype,"_clearSegments",void 0),e([_e()],di.prototype,"_skipFirstInLoop",void 0),e([_e()],di.prototype,"_saving",void 0),e([_e()],di.prototype,"_previewing",void 0),e([_e()],di.prototype,"_hasUserInteraction",void 0),di=e([ce("segment-sequence-editor")],di);const hi="/api/aqara_advanced_lighting";let pi=class extends re{constructor(){super(...arguments),this.translations={},this.mode="upload",this._url="",this._saveThumbnail=!0,this._extractBrightness=!1,this.extracting=!1,this._error="",this._previewSrc=""}_localize(e){return it(this.translations,e)}render(){return N`
      <div class="extractor-container">
        <!-- Upload mode -->
        ${"upload"===this.mode?N`
          <div
            class="drop-zone ${this._previewSrc?"has-preview":""}"
            @click=${this._triggerFileInput}
            @dragover=${this._handleDragOver}
            @dragleave=${this._handleDragLeave}
            @drop=${this._handleDrop}
          >
            ${this._previewSrc?N`
              <img class="preview-image" src="${this._previewSrc}" alt="Preview" />
              <div class="preview-overlay">
                <ha-icon icon="mdi:swap-horizontal"></ha-icon>
                <span>${this._localize("image_extractor.change_image")}</span>
              </div>
            `:N`
              <ha-icon icon="mdi:image-plus" class="drop-icon"></ha-icon>
              <span class="drop-text">
                ${this._localize("image_extractor.drop_hint")}
              </span>
            `}
          </div>
          <input
            type="file"
            accept="image/*"
            style="display:none"
            @change=${this._handleFileSelected}
          />
        `:N`
          <!-- URL mode -->
          <div class="url-input-row">
            ${Qe({value:this._url,label:this._localize("image_extractor.url_label"),onInput:this._handleUrlInput,style:"flex:1"})}
          </div>
        `}

        <!-- Options -->
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._extractBrightness}
              @change=${this._handleBrightnessToggle}
            ></ha-switch>
            <span>${this._localize("image_extractor.extract_brightness")}</span>
          </label>
        </div>
        <div class="option-row">
          <label class="option-toggle">
            <ha-switch
              .checked=${this._saveThumbnail}
              @change=${this._handleThumbnailToggle}
            ></ha-switch>
            <span>${this._localize("image_extractor.save_thumbnail")}</span>
          </label>
        </div>

        <!-- Error display -->
        ${this._error?N`
          <div class="error-message">${this._error}</div>
        `:""}

      </div>
    `}hasInput(){return"upload"===this.mode?!!this._previewSrc:!!this._url.trim()}_triggerFileInput(){const e=this.shadowRoot.querySelector('input[type="file"]');e?.click()}_handleDragOver(e){e.preventDefault(),e.stopPropagation(),e.currentTarget.classList.add("dragover")}_handleDragLeave(e){e.preventDefault(),e.stopPropagation(),e.currentTarget.classList.remove("dragover")}_handleDrop(e){e.preventDefault(),e.stopPropagation(),e.currentTarget.classList.remove("dragover");const t=e.dataTransfer?.files?.[0];t&&t.type.startsWith("image/")&&this._setFilePreview(t)}_handleFileSelected(e){const t=e.target,i=t.files?.[0];i&&this._setFilePreview(i)}_setFilePreview(e){this._selectedFile=e;const t=new FileReader;t.onload=()=>{this._previewSrc=t.result,this._error=""},t.readAsDataURL(e)}_handleUrlInput(e){this._url=e.target.value,this._error=""}_handleBrightnessToggle(e){this._extractBrightness=e.target.checked}_handleThumbnailToggle(e){this._saveThumbnail=e.target.checked}async extract(){if(!this.extracting){this.extracting=!0,this._error="";try{let e;if("upload"===this.mode){if(!this._selectedFile)return void(this._error=this._localize("image_extractor.error_no_file")||"No file selected");const t=new FormData;t.append("file",this._selectedFile),t.append("num_colors","8"),t.append("save_thumbnail",this._saveThumbnail?"true":"false"),t.append("extract_brightness",this._extractBrightness?"true":"false"),e=await this.hass.fetchWithAuth(`${hi}/extract_colors`,{method:"POST",body:t})}else e=await this.hass.fetchWithAuth(`${hi}/extract_colors`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:this._url.trim(),num_colors:8,save_thumbnail:this._saveThumbnail,extract_brightness:this._extractBrightness})});if(!e.ok){const t=await e.text();return void(this._error=t||(this._localize("image_extractor.error_server")||"Error {status}").replace("{status}",String(e.status)))}const t=await e.json(),i=t.colors.map(e=>({x:e.x,y:e.y,brightness_pct:e.brightness_pct})),s={colors:i};t.thumbnail_id&&(s.thumbnailId=t.thumbnail_id),this.dispatchEvent(new CustomEvent("colors-extracted",{detail:s,bubbles:!0,composed:!0}))}catch(e){this._error=e.message||this._localize("image_extractor.error_failed")||"Extraction failed"}finally{this.extracting=!1}}}cancel(){this.dispatchEvent(new CustomEvent("extractor-cancelled",{bubbles:!0,composed:!0}))}};var _i;pi.styles=n`
    :host {
      display: block;
    }

    .extractor-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .drop-zone {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 120px;
      border: 2px dashed var(--divider-color, #ddd);
      border-radius: 8px;
      cursor: pointer;
      transition: border-color 0.2s, background 0.2s;
      overflow: hidden;
    }

    .drop-zone:hover,
    .drop-zone.dragover {
      border-color: var(--primary-color);
      background: rgba(var(--rgb-primary-color, 33,150,243), 0.05);
    }

    .drop-zone.has-preview {
      border-style: solid;
      min-height: 150px;
    }

    .preview-image {
      width: 100%;
      height: 150px;
      object-fit: cover;
      display: block;
    }

    .preview-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.5);
      color: var(--text-primary-color);
      opacity: 0;
      transition: opacity 0.2s;
      font-size: 13px;
    }

    .drop-zone:hover .preview-overlay {
      opacity: 1;
    }

    .drop-icon {
      --mdc-icon-size: 36px;
      color: var(--secondary-text-color);
    }

    .drop-text {
      color: var(--secondary-text-color);
      font-size: 13px;
    }

    .url-input-row {
      display: flex;
    }

    .url-input-row ha-input {
      width: 100%;
    }

    .option-row {
      display: flex;
      align-items: center;
    }

    .option-toggle {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--primary-text-color);
      cursor: pointer;
    }

    .error-message {
      color: var(--error-color, #db4437);
      font-size: 12px;
      padding: 4px 8px;
      background: rgba(var(--rgb-error-color, 219,68,55), 0.1);
      border-radius: 4px;
    }

  `,e([pe({attribute:!1})],pi.prototype,"hass",void 0),e([pe({type:Object})],pi.prototype,"translations",void 0),e([pe({type:String})],pi.prototype,"mode",void 0),e([_e()],pi.prototype,"_url",void 0),e([_e()],pi.prototype,"_saveThumbnail",void 0),e([_e()],pi.prototype,"_extractBrightness",void 0),e([_e()],pi.prototype,"extracting",void 0),e([_e()],pi.prototype,"_error",void 0),e([_e()],pi.prototype,"_previewSrc",void 0),pi=e([ce("image-color-extractor")],pi);let ui=_i=class extends(mt(re)){constructor(){super(...arguments),this.translations={},this.editMode=!1,this.hasSelectedEntities=!1,this.isCompatible=!0,this.selectedEntities=[],this.previewActive=!1,this.colorHistory=[],this.defaultAudioEntity="",this._name="",this._icon="",this._steps=[],this._transitionTime=600,this._holdTime=0,this._distributionMode="shuffle_rotate",this._offsetDelay=0,this._randomOrder=!1,this._loopMode="continuous",this._loopCount=3,this._endBehavior="restore",this._saving=!1,this._previewing=!1,this._hasUserInteraction=!1,this._editingColorIndex=null,this._editingColor=null,this._showExtractor=!1,this._extractorMode="upload",this._audioEnabled=!1,this._audioEntity="",this._audioSensitivity=50,this._audioBrightnessCurve="linear",this._audioBrightnessMin=30,this._audioBrightnessMax=100,this._audioColorAdvance="on_onset",this._audioTransitionSpeed=50,this._audioDetectionMode="spectral_flux",this._audioFrequencyZone=!1,this._audioSilenceBehavior="slow_cycle",this._audioPredictionAggressiveness=50,this._audioLatencyCompensationMs=150,this._audioColorByFrequency=!1,this._audioRolloffBrightness=!1,this._cachedLoopModeOptions=[],this._cachedEndBehaviorOptions=[],this._audioModeRegistry=null,this._cachedAudioDetectionModeOptions=[],this._cachedDistributionModeOptions=[],this._colorIdCounter=0}get _currentAudioPreset(){for(const[e,t]of Object.entries(_i.AUDIO_PRESETS))if(this._audioColorAdvance===t.color_advance&&this._audioDetectionMode===t.detection_mode&&this._audioSensitivity===t.sensitivity&&this._audioTransitionSpeed===t.transition_speed&&this._audioBrightnessCurve===t.brightness_curve&&this._audioBrightnessMin===t.brightness_min&&this._audioBrightnessMax===t.brightness_max&&this._audioFrequencyZone===t.frequency_zone&&this._audioColorByFrequency===t.color_by_frequency&&this._audioRolloffBrightness===t.rolloff_brightness&&this._audioSilenceBehavior===t.silence_behavior&&this._audioPredictionAggressiveness===t.prediction_aggressiveness&&this._audioLatencyCompensationMs===t.latency_compensation_ms)return e;return"custom"}get _audioPresetOptions(){const e=ii(this.hass,this._audioEntity),t=this._localize("dynamic_scene.audio_mode_pro_badge")||"pro",i=Object.entries(_i.AUDIO_PRESETS).filter(([e,t])=>!function(e,t){if(!e)return!1;const i=e.find(e=>e.constant===t);return!0===i?.hidden}(this._audioModeRegistry,t.color_advance)).map(([i,s])=>{const o=this._localize(`dynamic_scene.audio_preset_${i}`)||i;return{value:i,label:s.requires_pro&&"pro"!==e?`${o} (${t})`:o}});return i.push({value:"custom",label:this._localize("dynamic_scene.audio_preset_custom")||"Custom"}),i}get _colors(){return this._steps}set _colors(e){this._steps=e}willUpdate(e){if(e.has("translations")){const e=e=>this._localize(e);this._cachedLoopModeOptions=st(e),this._cachedEndBehaviorOptions=ot(e,"dynamic_scene.end_behavior_restore"),this._cachedAudioDetectionModeOptions=[{value:"spectral_flux",label:e("dynamic_scene.audio_detection_spectral_flux")||"Spectral flux (all genres)"},{value:"bass_energy",label:e("dynamic_scene.audio_detection_bass_energy")||"Bass energy (rhythmic music)"},{value:"complex_domain",label:e("dynamic_scene.audio_detection_complex_domain")||"Complex domain (phase + magnitude)"}],this._cachedDistributionModeOptions=[{value:"shuffle_rotate",label:e("dynamic_scene.distribution_shuffle_rotate")||"Shuffle and rotate"},{value:"synchronized",label:e("dynamic_scene.distribution_synchronized")||"Synchronized"},{value:"random",label:e("dynamic_scene.distribution_random")||"Random"}]}}get _loopModeOptions(){return this._cachedLoopModeOptions}get _endBehaviorOptions(){return this._cachedEndBehaviorOptions}get _audioColorAdvanceOptions(){return si(this._audioModeRegistry,ii(this.hass,this._audioEntity),e=>this._localize(e))}get _audioDetectionModeOptions(){return this._cachedAudioDetectionModeOptions}get _distributionModeOptions(){return this._cachedDistributionModeOptions}connectedCallback(){super.connectedCallback(),0!==this._colors.length||this.preset||this._addDefaultColors(),this._fetchAudioModeRegistry()}async _fetchAudioModeRegistry(){const e=await ti(this.hass);null!==e&&(this._audioModeRegistry=e,this.requestUpdate())}updated(e){super.updated(e),e.has("draft")&&this.draft?this._restoreDraft(this.draft):e.has("preset")&&this.preset&&(this._hasUserInteraction=!0,this._loadPreset(this.preset))}_loadPreset(e){this._name=e.name,this._icon=e.icon||"",this._thumbnail=e.thumbnail,this._transitionTime=e.transition_time,this._holdTime=e.hold_time,this._distributionMode=e.distribution_mode,this._offsetDelay=e.offset_delay,this._randomOrder=e.random_order,this._loopMode=e.loop_mode,this._loopCount=e.loop_count||3,this._endBehavior=e.end_behavior,this._audioEnabled=!(!e.audio_entity&&!e.audio_color_advance),this._audioEntity=e.audio_entity||"",this._audioSensitivity=e.audio_sensitivity??50,this._audioBrightnessCurve=void 0!==e.audio_brightness_curve?e.audio_brightness_curve:"linear",this._audioBrightnessMin=e.audio_brightness_min??30,this._audioBrightnessMax=e.audio_brightness_max??100,this._audioColorAdvance=e.audio_color_advance??"on_onset",this._audioTransitionSpeed=e.audio_transition_speed??50,this._audioDetectionMode=e.audio_detection_mode??"spectral_flux",this._audioFrequencyZone=e.audio_frequency_zone??!1,this._audioSilenceBehavior=e.audio_silence_behavior??"slow_cycle",this._audioPredictionAggressiveness=e.audio_prediction_aggressiveness??50,this._audioLatencyCompensationMs=e.audio_latency_compensation_ms??150,this._audioColorByFrequency=e.audio_color_by_frequency??!1,this._audioRolloffBrightness=e.audio_rolloff_brightness??!1,this._colors=e.colors.map((e,t)=>({...e,id:`color-${t}-${Date.now()}`}))}getDraftState(){return{name:this._name,icon:this._icon,thumbnail:this._thumbnail,colors:this._colors.map(e=>({x:e.x,y:e.y,brightness_pct:e.brightness_pct})),transitionTime:this._transitionTime,holdTime:this._holdTime,distributionMode:this._distributionMode,offsetDelay:this._offsetDelay,randomOrder:this._randomOrder,loopMode:this._loopMode,loopCount:this._loopCount,endBehavior:this._endBehavior,hasUserInteraction:this._hasUserInteraction,audioEnabled:this._audioEnabled,audioEntity:this._audioEntity,audioSensitivity:this._audioSensitivity,audioBrightnessCurve:this._audioBrightnessCurve,audioBrightnessMin:this._audioBrightnessMin,audioBrightnessMax:this._audioBrightnessMax,audioColorAdvance:this._audioColorAdvance,audioTransitionSpeed:this._audioTransitionSpeed,audioDetectionMode:this._audioDetectionMode,audioFrequencyZone:this._audioFrequencyZone,audioSilenceBehavior:this._audioSilenceBehavior,audioPredictionAggressiveness:this._audioPredictionAggressiveness,audioLatencyCompensationMs:this._audioLatencyCompensationMs,audioColorByFrequency:this._audioColorByFrequency,audioRolloffBrightness:this._audioRolloffBrightness}}resetToDefaults(){this._name="",this._icon="",this._thumbnail=void 0,this._transitionTime=120,this._holdTime=0,this._distributionMode="shuffle_rotate",this._offsetDelay=0,this._randomOrder=!1,this._loopMode="continuous",this._loopCount=3,this._endBehavior="restore",this._hasUserInteraction=!1,this._audioEnabled=!1,this._audioEntity="",this._audioSensitivity=50,this._audioBrightnessCurve="linear",this._audioBrightnessMin=30,this._audioBrightnessMax=100,this._audioColorAdvance="on_onset",this._audioTransitionSpeed=50,this._audioDetectionMode="spectral_flux",this._audioFrequencyZone=!1,this._audioSilenceBehavior="slow_cycle",this._audioPredictionAggressiveness=50,this._audioLatencyCompensationMs=150,this._audioColorByFrequency=!1,this._audioRolloffBrightness=!1,this._addDefaultColors()}_restoreDraft(e){this._name=e.name,this._icon=e.icon,this._thumbnail=e.thumbnail,this._transitionTime=e.transitionTime,this._holdTime=e.holdTime,this._distributionMode=e.distributionMode,this._offsetDelay=e.offsetDelay,this._randomOrder=e.randomOrder,this._loopMode=e.loopMode,this._loopCount=e.loopCount,this._endBehavior=e.endBehavior,this._hasUserInteraction=e.hasUserInteraction??!1,this._audioEnabled=e.audioEnabled??!1,this._audioEntity=e.audioEntity??"",this._audioSensitivity=e.audioSensitivity??50,this._audioBrightnessCurve=void 0!==e.audioBrightnessCurve?e.audioBrightnessCurve:"linear",this._audioBrightnessMin=e.audioBrightnessMin??30,this._audioBrightnessMax=e.audioBrightnessMax??100,this._audioColorAdvance=e.audioColorAdvance??"on_onset",this._audioTransitionSpeed=e.audioTransitionSpeed??50,this._audioDetectionMode=e.audioDetectionMode??"spectral_flux",this._audioFrequencyZone=e.audioFrequencyZone??!1,this._audioSilenceBehavior=e.audioSilenceBehavior??"slow_cycle",this._audioPredictionAggressiveness=e.audioPredictionAggressiveness??50,this._audioLatencyCompensationMs=e.audioLatencyCompensationMs??150,this._audioColorByFrequency=e.audioColorByFrequency??!1,this._audioRolloffBrightness=e.audioRolloffBrightness??!1,this._colors=e.colors.map((e,t)=>({...e,id:`color-${t}-${Date.now()}`}))}_addDefaultColors(){this._colors=[{id:`color-0-${Date.now()}`,x:.55,y:.41,brightness_pct:100},{id:`color-1-${Date.now()+1}`,x:.15,y:.06,brightness_pct:100}]}_generateColorId(){return`color-${++this._colorIdCounter}-${Date.now()}`}_handleNameChange(e){this._name=e.detail.value||"",this._hasUserInteraction=!0}_handleIconChange(e){this._icon=e.detail.value||"",this._hasUserInteraction=!0}_handleTransitionTimeChange(e){this._transitionTime=e.detail.value??120,this._hasUserInteraction=!0}_handleHoldTimeChange(e){this._holdTime=e.detail.value??0,this._hasUserInteraction=!0}_handleDistributionModeChange(e){this._distributionMode=e.detail.value||"shuffle_rotate",this._hasUserInteraction=!0}_handleOffsetDelayChange(e){this._offsetDelay=e.detail.value??0,this._hasUserInteraction=!0}_handleRandomOrderChange(e){this._randomOrder=e.detail.value??!1,this._hasUserInteraction=!0}_handleLoopModeChange(e){this._loopMode=e.detail.value||"continuous",this._hasUserInteraction=!0}_handleLoopCountChange(e){this._loopCount=e.detail.value??3,this._hasUserInteraction=!0}_handleEndBehaviorChange(e){this._endBehavior=e.detail.value||"restore",this._hasUserInteraction=!0}_handleAudioEnabledChange(e){this._audioEnabled=e.detail.value??!1,this._audioEnabled&&!this._audioEntity&&this.defaultAudioEntity&&(this._audioEntity=this.defaultAudioEntity),this._hasUserInteraction=!0}_handleAudioEntityChange(e){this._audioEntity=e.detail.value||"",this._hasUserInteraction=!0}_handleAudioSensitivityChange(e){this._audioSensitivity=e.detail.value??50,this._hasUserInteraction=!0}_handleAudioBrightnessCurveChange(e){const t=e.detail.value;this._audioBrightnessCurve="disabled"===t?null:t||"linear",this._hasUserInteraction=!0}_handleAudioBrightnessMinChange(e){this._audioBrightnessMin=e.detail.value??30,this._hasUserInteraction=!0}_handleAudioBrightnessMaxChange(e){this._audioBrightnessMax=e.detail.value??100,this._hasUserInteraction=!0}_handleAudioColorAdvanceChange(e){this._audioColorAdvance=e.detail.value||"on_onset",this._hasUserInteraction=!0}_handleAudioPresetChange(e){const t=e.detail.value;if("custom"===t)return;const i=_i.AUDIO_PRESETS[t];i&&(this._audioColorAdvance=i.color_advance,this._audioDetectionMode=i.detection_mode,this._audioSensitivity=i.sensitivity,this._audioTransitionSpeed=i.transition_speed,this._audioBrightnessCurve=i.brightness_curve,this._audioBrightnessMin=i.brightness_min,this._audioBrightnessMax=i.brightness_max,this._audioFrequencyZone=i.frequency_zone,this._audioColorByFrequency=i.color_by_frequency,this._audioRolloffBrightness=i.rolloff_brightness,this._audioSilenceBehavior=i.silence_behavior,this._audioPredictionAggressiveness=i.prediction_aggressiveness,this._audioLatencyCompensationMs=i.latency_compensation_ms,this._hasUserInteraction=!0)}_handleAudioDetectionModeChange(e){this._audioDetectionMode=e.detail.value||"spectral_flux",this._hasUserInteraction=!0}_handleAudioFrequencyZoneChange(e){this._audioFrequencyZone=e.detail.value??!1,this._hasUserInteraction=!0}_handleAudioSilenceBehaviorChange(e){this._audioSilenceBehavior=e.detail.value||"slow_cycle",this._hasUserInteraction=!0}_handleAudioPredictionAggressivenessChange(e){this._audioPredictionAggressiveness=e.detail.value??50,this._hasUserInteraction=!0}_handleAudioLatencyCompensationChange(e){this._audioLatencyCompensationMs=e.detail.value??150,this._hasUserInteraction=!0}_handleAudioColorByFrequencyChange(e){this._audioColorByFrequency=e.detail.value??!1,this._hasUserInteraction=!0}_handleAudioRolloffBrightnessChange(e){this._audioRolloffBrightness=e.detail.value??!1,this._hasUserInteraction=!0}_handleAudioTransitionSpeedChange(e){this._audioTransitionSpeed=e.detail.value??50,this._hasUserInteraction=!0}_handleColorBrightnessChange(e,t){const i=t.detail.value??100;this._colors=this._colors.map(t=>t.id===e?{...t,brightness_pct:i}:t),this._hasUserInteraction=!0}_openColorPicker(e){const t=this._colors[e];t&&(this._editingColorIndex=e,this._editingColor={x:t.x,y:t.y})}_handleColorPickerChange(e){this._editingColor=e.detail.color}_confirmColorPicker(){if(null!==this._editingColorIndex&&null!==this._editingColor){const e=ut(this.colorHistory,this._editingColor);this.dispatchEvent(new CustomEvent("color-history-changed",{detail:{colorHistory:e},bubbles:!0,composed:!0})),this._colors=this._colors.map((e,t)=>t===this._editingColorIndex?{...e,x:this._editingColor.x,y:this._editingColor.y}:e),this._hasUserInteraction=!0}this._closeColorPicker()}_handleHistoryColorSelected(e){const t=e.detail.color;this._editingColor={x:t.x,y:t.y}}_closeColorPicker(){this._editingColorIndex=null,this._editingColor=null}_addColor(){if(this._colors.length>=8)return;const e=this._colors[this._colors.length-1],t=function(e){const t=je(e);return Ge({h:(t.h+30)%360,s:t.s})}(e?{x:e.x,y:e.y}:{x:.68,y:.31});this._colors=[...this._colors,{id:this._generateColorId(),x:t.x,y:t.y,brightness_pct:e?.brightness_pct??100}],this._hasUserInteraction=!0}_handleColorsExtracted(e){const{colors:t,thumbnailId:i}=e.detail;if(this._colors=t.map(e=>({id:this._generateColorId(),x:e.x,y:e.y,brightness_pct:e.brightness_pct})),i){const e=this.preset?.thumbnail;this._thumbnail&&this._thumbnail!==e&&this._deleteThumbnail(this._thumbnail),this._thumbnail=i}this._showExtractor=!1,this._hasUserInteraction=!0}_removeColor(e){this._colors.length<=1||(this._colors=this._colors.filter(t=>t.id!==e),this._hasUserInteraction=!0)}_getPresetData(){const e={name:this._name,icon:this._icon||void 0,thumbnail:this._thumbnail||void 0,colors:this._colors.map(e=>({x:e.x,y:e.y,brightness_pct:e.brightness_pct})),transition_time:this._transitionTime,hold_time:this._holdTime,distribution_mode:this._distributionMode,offset_delay:this._offsetDelay,random_order:this._randomOrder,loop_mode:this._loopMode,end_behavior:this._endBehavior};return"count"===this._loopMode&&(e.loop_count=this._loopCount),this._audioEnabled&&this._audioEntity&&(e.audio_entity=this._audioEntity,e.audio_sensitivity=this._audioSensitivity,e.audio_brightness_curve=this._audioBrightnessCurve,e.audio_brightness_min=this._audioBrightnessMin,e.audio_brightness_max=this._audioBrightnessMax,e.audio_color_advance=this._audioColorAdvance,e.audio_transition_speed=this._audioTransitionSpeed,e.audio_detection_mode=this._audioDetectionMode,e.audio_frequency_zone=this._audioFrequencyZone,e.audio_silence_behavior=this._audioSilenceBehavior,e.audio_prediction_aggressiveness=this._audioPredictionAggressiveness,e.audio_latency_compensation_ms=this._audioLatencyCompensationMs,e.audio_color_by_frequency=this._audioColorByFrequency,e.audio_rolloff_brightness=this._audioRolloffBrightness),e}async _preview(){if(this.hass&&!this._previewing&&0!==this._colors.length){this._previewing=!0;try{this.dispatchEvent(new CustomEvent("preview",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._previewing=!1}}}_stopPreview(){this.dispatchEvent(new CustomEvent("stop-preview",{bubbles:!0,composed:!0}))}async _save(){if(this._name.trim()&&0!==this._colors.length){this._saving=!0;try{this.dispatchEvent(new CustomEvent("save",{detail:this._getPresetData(),bubbles:!0,composed:!0}))}finally{this._saving=!1}}}_cancel(){this._hasUserInteraction=!1;const e=this.preset?.thumbnail;this._thumbnail&&this._thumbnail!==e&&this._deleteThumbnail(this._thumbnail),this.dispatchEvent(new CustomEvent("cancel",{bubbles:!0,composed:!0}))}_deleteThumbnail(e){const t=this.hass?.auth?.data?.access_token;t&&fetch(`/api/aqara_advanced_lighting/thumbnails/${e}`,{method:"DELETE",headers:{Authorization:`Bearer ${t}`}}).catch(()=>{})}_formatTime(e){if(e<60)return`${e}s`;if(e<3600){const t=Math.floor(e/60),i=e%60;return i>0?`${t}m ${i}s`:`${t}m`}{const t=Math.floor(e/3600),i=Math.floor(e%3600/60);return i>0?`${t}h ${i}m`:`${t}h`}}_renderColorSlot(e,t){const i=Le({x:e.x,y:e.y},255);return N`
      <div class="color-slot step-item">
        ${this._renderDragHandle(t)}
        <span class="color-slot-number">${t+1}</span>
        <div
          class="color-preview"
          role="button"
          tabindex="0"
          style="background-color: ${i}"
          @click=${()=>this._openColorPicker(t)}
          @keydown=${e=>{"Enter"!==e.key&&" "!==e.key||(e.preventDefault(),this._openColorPicker(t))}}
          title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.color_edit")}"
          aria-label="${this._localize("editors.color_label")||"Color"} ${t+1}: ${i}"
        ></div>
        <div class="brightness-control">
          <ha-selector
            .hass=${this.hass}
            .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
            .value=${e.brightness_pct}
            @value-changed=${t=>this._handleColorBrightnessChange(e.id,t)}
          ></ha-selector>
        </div>
        <div class="color-slot-actions">
          ${this._colors.length>1?N`
            <ha-icon-button
              @click=${()=>this._removeColor(e.id)}
              title="${this.hass.localize("component.aqara_advanced_lighting.panel.tooltips.color_remove")}"
            >
              <ha-icon icon="mdi:close"></ha-icon>
            </ha-icon-button>
          `:""}
        </div>
      </div>
    `}_localize(e,t){return it(this.translations,e,t)}render(){return N`
      <div class="editor-content">
        <!-- Header: Name and Icon -->
        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.name_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{text:{}}}
              .value=${this._name}
              @value-changed=${this._handleNameChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.icon_label")}</span>
            <div class="icon-field-row">
              <ha-selector
                .hass=${this.hass}
                .selector=${{icon:{}}}
                .value=${this._icon}
                @value-changed=${this._handleIconChange}
              ></ha-selector>
              ${this._icon?N`
                <ha-icon-button
                  class="icon-clear-btn"
                  @click=${()=>{this._icon="",this._hasUserInteraction=!0}}
                  title=${this._localize("editors.icon_clear_tooltip")}
                >
                  <ha-icon icon="mdi:close"></ha-icon>
                </ha-icon-button>
              `:""}
            </div>
            <span class="form-hint">${this._localize("editors.icon_auto_hint")}</span>
          </div>
        </div>

        <!-- Colors Section (1-8 reorderable) -->
        <div class="form-section">
          <span class="form-label">${this._localize("editors.colors_brightness_label")||"Colors and brightness (1-8)"}</span>
          <div class="color-slots-container step-list">
            ${this._colors.map((e,t)=>N`
              ${this._renderDropIndicator(t)}
              ${this._renderColorSlot(e,t)}
            `)}
            ${this._renderDropIndicator(this._colors.length)}

            <div class="color-action-buttons">
              <button
                class="add-color-btn ${this._colors.length>=8?"disabled":""}"
                @click=${this._addColor}
                ?disabled=${this._colors.length>=8}
              >
                <ha-icon icon="mdi:plus"></ha-icon>
                ${this._localize("dynamic_scene.add_color_button")||"Add color"}
              </button>
              <button
                class="add-color-btn extract-btn"
                @click=${()=>{this._showExtractor=!0}}
              >
                <ha-icon icon="mdi:image-search-outline"></ha-icon>
                ${this._localize("dynamic_scene.extract_from_image")||"Extract from image"}
              </button>
            </div>
          </div>
        </div>

        <!-- Image Color Extractor Dialog -->
        <ha-dialog
          class="extractor-dialog"
          .open=${this._showExtractor}
          @closed=${()=>{this._showExtractor=!1}}
          .headerTitle=${this._localize("dynamic_scene.extract_from_image")||"Extract from image"}
        >
          <span slot="headerNavigationIcon"></span>
          <div slot="headerActionItems" class="extractor-mode-toggle">
            <button
              class="mode-btn ${"upload"===this._extractorMode?"active":""}"
              @click=${()=>{this._extractorMode="upload"}}
            >
              <ha-icon icon="mdi:upload"></ha-icon>
              ${this._localize("image_extractor.upload_tab")}
            </button>
            <button
              class="mode-btn ${"url"===this._extractorMode?"active":""}"
              @click=${()=>{this._extractorMode="url"}}
            >
              <ha-icon icon="mdi:link"></ha-icon>
              ${this._localize("image_extractor.url_tab")}
            </button>
          </div>
          <image-color-extractor
            .hass=${this.hass}
            .translations=${this.translations}
            .mode=${this._extractorMode}
            @colors-extracted=${this._handleColorsExtracted}
            @extractor-cancelled=${()=>{this._showExtractor=!1}}
          ></image-color-extractor>
          ${Je(this._localize("image_extractor.cancel_button"),this._localize("image_extractor.extract_button"),()=>{this._showExtractor=!1},()=>{this.shadowRoot.querySelector("image-color-extractor")?.extract()},"mdi:palette-swatch")}
        </ha-dialog>

        <!-- Timing Section -->
        <div class="form-section">
          <span class="form-label">${this._localize("dynamic_scene.timing_label")||"Timing"}</span>
          <div class="timing-section">
            <div class="timing-field">
              <div class="timing-label">
                <span class="form-label">${this._localize("editors.transition_time_label")}</span>
                <span class="timing-value">${this._formatTime(this._transitionTime)}</span>
              </div>
              <ha-selector
                .hass=${this.hass}
                .selector=${{number:{min:30,max:3600,step:5,mode:"slider",unit_of_measurement:"s"}}}
                .value=${this._transitionTime}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleTransitionTimeChange}
              ></ha-selector>
            </div>
            <div class="timing-field">
              <div class="timing-label">
                <span class="form-label">${this._localize("editors.hold_time_label")}</span>
                <span class="timing-value">${this._formatTime(this._holdTime)}</span>
              </div>
              <ha-selector
                .hass=${this.hass}
                .selector=${{number:{min:0,max:3600,step:5,mode:"slider",unit_of_measurement:"s"}}}
                .value=${this._holdTime}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleHoldTimeChange}
              ></ha-selector>
            </div>
          </div>
        </div>

        <!-- Color Assignment + Randomize Light Order -->
        <div class="form-row-pair">
          <div class="form-section">
            <span class="form-label">${this._localize("dynamic_scene.distribution_mode_label")||"Color assignment"}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._distributionModeOptions,mode:"dropdown"}}}
              .value=${this._distributionMode}
              @value-changed=${this._handleDistributionModeChange}
            ></ha-selector>
          </div>
          <div class="form-section boolean-left">
            <span class="form-label">${this._localize("dynamic_scene.random_order_label")||"Randomize light order"}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{boolean:{}}}
              .value=${this._randomOrder}
              @value-changed=${this._handleRandomOrderChange}
            ></ha-selector>
          </div>
        </div>

        <!-- Ripple Effect + Maximum Scene Brightness -->
        <div class="form-row-pair">
          <div class="form-section">
            <span class="form-label">${this._localize("dynamic_scene.ripple_effect_label")||"Ripple effect"}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{number:{min:0,max:120,step:1,mode:"slider",unit_of_measurement:"s"}}}
              .value=${this._offsetDelay}
              @value-changed=${this._handleOffsetDelayChange}
            ></ha-selector>
          </div>
        </div>

        <!-- Loop Behavior -->
        <div class="form-row-pair">
          <div class="form-field">
            <span class="form-label">${this._localize("editors.loop_mode_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._loopModeOptions,mode:"dropdown"}}}
              .value=${this._loopMode}
              .disabled=${this._audioEnabled}
              @value-changed=${this._handleLoopModeChange}
            ></ha-selector>
          </div>
          <div class="form-field">
            <span class="form-label">${this._localize("editors.end_behavior_label")}</span>
            <ha-selector
              .hass=${this.hass}
              .selector=${{select:{options:this._endBehaviorOptions,mode:"dropdown"}}}
              .value=${this._endBehavior}
              .disabled=${this._audioEnabled}
              @value-changed=${this._handleEndBehaviorChange}
            ></ha-selector>
          </div>
        </div>

        ${"count"===this._loopMode?N`
          <div class="form-row">
            <span class="form-label">${this._localize("editors.loop_count_label")}</span>
            <div class="form-input">
              <ha-selector
                .hass=${this.hass}
                .selector=${{number:{min:1,max:100,mode:"box"}}}
                .value=${this._loopCount}
                .disabled=${this._audioEnabled}
                @value-changed=${this._handleLoopCountChange}
              ></ha-selector>
            </div>
          </div>
        `:""}

        <!-- Audio Reactive Section -->
        <div class="form-section">
          <div class="form-row-pair">
            <div class="form-section boolean-left">
              <span class="form-label">${this._localize("dynamic_scene.audio_reactive_label")||"Audio reactive"}</span>
              <ha-selector
                .hass=${this.hass}
                .selector=${{boolean:{}}}
                .value=${this._audioEnabled}
                @value-changed=${this._handleAudioEnabledChange}
              ></ha-selector>
            </div>
          </div>

          ${this._audioEnabled?N`
            <!-- Row 1: Audio preset + Entity selector -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize("dynamic_scene.audio_preset_label")||"Audio preset"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{select:{options:this._audioPresetOptions,mode:"dropdown"}}}
                  .value=${this._currentAudioPreset}
                  @value-changed=${this._handleAudioPresetChange}
                ></ha-selector>
              </div>
              <div class="form-field">
                <span class="form-label">${this._localize("dynamic_scene.audio_entity_label")||"Audio sensor entity"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{entity:{domain:"binary_sensor"}}}
                  .value=${this._audioEntity}
                  @value-changed=${this._handleAudioEntityChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Row 2: Detection mode + Color advance -->
            <div class="form-row-pair">
              <div class="form-field">
                <span class="form-label">${this._localize("dynamic_scene.audio_detection_mode_label")||"Detection mode"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{select:{options:this._audioDetectionModeOptions,mode:"dropdown"}}}
                  .value=${this._audioDetectionMode}
                  @value-changed=${this._handleAudioDetectionModeChange}
                ></ha-selector>
              </div>
              <div class="form-field">
                <span class="form-label">${this._localize("dynamic_scene.audio_color_advance_label")||"Color advance"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{select:{options:this._audioColorAdvanceOptions,mode:"dropdown"}}}
                  .value=${this._audioColorAdvance}
                  @value-changed=${this._handleAudioColorAdvanceChange}
                ></ha-selector>
                <!--
                  v1.3.0: pro-tier mode tooltip removed because no currently-
                  visible mode has requires_pro=True (bass_kick and
                  freq_to_hue are hidden via MODE_REGISTRY's hidden flag).
                  Restore this block when the hidden modes are re-enabled —
                  see docs/plans/2026-04-27-descope-pro-dsp-features-for-v1.3.0.md.
                -->
              </div>
            </div>

            <!-- Row 3: Sensitivity + Transition speed -->
            <div class="timing-section">
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize("dynamic_scene.audio_sensitivity_label")||"Sensitivity"}</span>
                  <span class="timing-value">${this._audioSensitivity}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                  .value=${this._audioSensitivity}
                  @value-changed=${this._handleAudioSensitivityChange}
                ></ha-selector>
              </div>
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize("dynamic_scene.audio_transition_speed_label")||"Transition speed"}</span>
                  <span class="timing-value">${this._audioTransitionSpeed}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!("on_onset"===this._audioColorAdvance||"beat_predictive"===this._audioColorAdvance||"onset_flash"===this._audioColorAdvance)}
                  .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                  .value=${this._audioTransitionSpeed}
                  @value-changed=${this._handleAudioTransitionSpeedChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Row 4: Prediction aggressiveness + Latency compensation -->
            <div class="timing-section">
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize("dynamic_scene.audio_prediction_aggressiveness_label")||"Prediction aggressiveness"}</span>
                  <span class="timing-value">${this._audioPredictionAggressiveness}%</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${"beat_predictive"!==this._audioColorAdvance}
                  .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                  .value=${this._audioPredictionAggressiveness}
                  @value-changed=${this._handleAudioPredictionAggressivenessChange}
                ></ha-selector>
              </div>
              <div class="timing-field">
                <div class="timing-label">
                  <span class="form-label">${this._localize("dynamic_scene.audio_latency_compensation_label")||"Latency compensation"}</span>
                  <span class="timing-value">${this._audioLatencyCompensationMs}ms</span>
                </div>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${"beat_predictive"!==this._audioColorAdvance}
                  .selector=${{number:{min:0,max:500,mode:"slider",unit_of_measurement:"ms"}}}
                  .value=${this._audioLatencyCompensationMs}
                  @value-changed=${this._handleAudioLatencyCompensationChange}
                ></ha-selector>
              </div>
            </div>

            <!-- Dropdowns: brightness curve and silence behavior -->
            <div class="audio-dropdowns-grid">
              <div class="form-section">
                <span class="form-label">${this._localize("dynamic_scene.audio_brightness_curve_label")||"Brightness curve"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .disabled=${!("on_onset"===this._audioColorAdvance||"continuous"===this._audioColorAdvance||"beat_predictive"===this._audioColorAdvance)}
                  .selector=${{select:{options:[{value:"disabled",label:this._localize("dynamic_scene.audio_brightness_curve_disabled")||"Disabled"},{value:"linear",label:this._localize("dynamic_scene.audio_brightness_curve_linear")||"Linear"},{value:"logarithmic",label:this._localize("dynamic_scene.audio_brightness_curve_logarithmic")||"Logarithmic"},{value:"exponential",label:this._localize("dynamic_scene.audio_brightness_curve_exponential")||"Exponential"}],mode:"dropdown"}}}
                  .value=${this._audioBrightnessCurve??"disabled"}
                  @value-changed=${this._handleAudioBrightnessCurveChange}
                ></ha-selector>
              </div>
              <div class="form-section">
                <span class="form-label">${this._localize("dynamic_scene.audio_silence_behavior_label")||"Silence behavior"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{select:{options:[{value:"hold",label:this._localize("dynamic_scene.audio_silence_hold")||"Hold last color"},{value:"slow_cycle",label:this._localize("dynamic_scene.audio_silence_slow_cycle")||"Slow cycle"},{value:"decay_min",label:this._localize("dynamic_scene.audio_silence_decay_min")||"Decay to min"},{value:"decay_mid",label:this._localize("dynamic_scene.audio_silence_decay_mid")||"Decay to mid"}],mode:"dropdown"}}}
                  .value=${this._audioSilenceBehavior}
                  @value-changed=${this._handleAudioSilenceBehaviorChange}
                ></ha-selector>
              </div>
            </div>

            ${this._audioBrightnessCurve?N`
            <div class="audio-sliders-row">
              <div class="form-section">
                <span class="form-label">${this._localize("dynamic_scene.audio_brightness_min_label")||"Brightness min"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{number:{min:0,max:100,mode:"slider",unit_of_measurement:"%"}}}
                  .value=${this._audioBrightnessMin}
                  @value-changed=${this._handleAudioBrightnessMinChange}
                ></ha-selector>
              </div>
              <div class="form-section">
                <span class="form-label">${this._localize("dynamic_scene.audio_brightness_max_label")||"Brightness max"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{number:{min:0,max:100,mode:"slider",unit_of_measurement:"%"}}}
                  .value=${this._audioBrightnessMax}
                  @value-changed=${this._handleAudioBrightnessMaxChange}
                ></ha-selector>
              </div>
            </div>
            `:""}

            <!-- Toggles: 3-per-row desktop, 2-per-row mobile -->
            <div class="audio-toggles-grid">
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize("dynamic_scene.audio_frequency_zone_label")||"Frequency zone"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{boolean:{}}}
                  .value=${this._audioFrequencyZone}
                  @value-changed=${this._handleAudioFrequencyZoneChange}
                ></ha-selector>
              </div>
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize("dynamic_scene.audio_color_by_frequency_label")||"Color by frequency"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{boolean:{}}}
                  .value=${this._audioColorByFrequency}
                  @value-changed=${this._handleAudioColorByFrequencyChange}
                ></ha-selector>
              </div>
              <div class="form-section boolean-left">
                <span class="form-label">${this._localize("dynamic_scene.audio_rolloff_brightness_label")||"Rolloff brightness"}</span>
                <ha-selector
                  .hass=${this.hass}
                  .selector=${{boolean:{}}}
                  .value=${this._audioRolloffBrightness}
                  @value-changed=${this._handleAudioRolloffBrightnessChange}
                ></ha-selector>
              </div>
            </div>

            <div class="preview-warning">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span>${this._localize("dynamic_scene.audio_overrides_timing_note")||"When audio reactive is enabled, transition time and hold time are controlled by the audio signal."}</span>
            </div>
          `:""}
        </div>

        <!-- Color Picker Modal -->
        <ha-dialog
          .open=${null!==this._editingColorIndex&&null!==this._editingColor}
          @closed=${this._closeColorPicker}
          .headerTitle=${this._localize("editors.color_picker_title")}
        >
          <span slot="headerNavigationIcon"></span>
          ${this._editingColor?N`
            <div
              slot="headerActionItems"
              class="color-picker-modal-preview"
              style="background-color: ${Le(this._editingColor,255)}"
            ></div>
          `:""}
          ${this._editingColor?N`
            <xy-color-picker
              .color=${this._editingColor}
              .size=${220}
              .showRgbInputs=${!0}
              .translations=${this.translations}
              @color-changed=${this._handleColorPickerChange}
            ></xy-color-picker>
            <color-history-swatches
              .colorHistory=${this.colorHistory}
              .translations=${this.translations}
              @color-selected=${this._handleHistoryColorSelected}
            ></color-history-swatches>
          `:""}
          ${Je(this._localize("editors.cancel_button"),this._localize("editors.apply_button"),()=>this._closeColorPicker(),()=>this._confirmColorPicker(),"mdi:check")}
        </ha-dialog>

        <!-- Preview Warning -->
        ${this.hasSelectedEntities?"":N`
          <div class="preview-warning">
            <ha-icon icon="mdi:information"></ha-icon>
            <span>${this._localize("dynamic_scene.select_lights_for_preview")||"Select light entities in the Activate tab to preview dynamic scenes on your devices."}</span>
          </div>
        `}

        <!-- Form Actions -->
        <div class="form-actions">
          <div class="form-actions-left">
            <ha-button @click=${this._cancel}>${this._localize("editors.cancel_button")}</ha-button>
            ${this._hasUserInteraction?N`
              <span class="unsaved-indicator">
                <span class="unsaved-dot"></span>
                ${this._localize("editors.unsaved_changes")}
              </span>
            `:""}
          </div>
          ${this.previewActive?N`
            <ha-button @click=${this._stopPreview}>
              <ha-icon icon="mdi:stop"></ha-icon>
              <span class="btn-text">${this._localize("editors.stop_button")}</span>
            </ha-button>
          `:N`
            <ha-button
              @click=${this._preview}
              .disabled=${this._previewing||0===this._colors.length||!this.hasSelectedEntities||!this.isCompatible}
              title=${this.hasSelectedEntities?this.isCompatible?"":this._localize("editors.tooltip_light_not_compatible"):this._localize("editors.tooltip_select_lights_first")}
            >
              <ha-icon icon="mdi:play"></ha-icon>
              <span class="btn-text">${this._localize("editors.preview_button")}</span>
            </ha-button>
          `}
          <ha-button
            @click=${this._save}
            .disabled=${!this._name.trim()||0===this._colors.length||this._saving}
          >
            <ha-icon icon="mdi:content-save"></ha-icon>
            <span class="btn-text">${this.editMode?this._localize("editors.update_button"):this._localize("editors.save_button")}</span>
          </ha-button>
        </div>
      </div>
    `}};var gi;ui.AUDIO_PRESETS={beat:{color_advance:"on_onset",detection_mode:"spectral_flux",sensitivity:60,transition_speed:80,brightness_curve:"linear",brightness_min:30,brightness_max:100,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!1},ambient:{color_advance:"intensity_breathing",detection_mode:"spectral_flux",sensitivity:50,transition_speed:20,brightness_curve:"logarithmic",brightness_min:20,brightness_max:80,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!0,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!1},concert:{color_advance:"beat_predictive",detection_mode:"complex_domain",sensitivity:50,transition_speed:50,brightness_curve:"linear",brightness_min:30,brightness_max:100,frequency_zone:!0,color_by_frequency:!0,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:70,latency_compensation_ms:150,requires_pro:!1},chill:{color_advance:"continuous",detection_mode:"spectral_flux",sensitivity:40,transition_speed:30,brightness_curve:"logarithmic",brightness_min:20,brightness_max:80,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!1},club:{color_advance:"onset_flash",detection_mode:"bass_energy",sensitivity:70,transition_speed:95,brightness_curve:"exponential",brightness_min:10,brightness_max:100,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"hold",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!1},kick:{color_advance:"bass_kick",detection_mode:"bass_energy",sensitivity:75,transition_speed:90,brightness_curve:null,brightness_min:30,brightness_max:100,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"decay_min",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!0},spectrum:{color_advance:"freq_to_hue",detection_mode:"spectral_flux",sensitivity:50,transition_speed:30,brightness_curve:"logarithmic",brightness_min:25,brightness_max:90,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"hold",prediction_aggressiveness:50,latency_compensation_ms:150,requires_pro:!0}},ui.styles=[Oe,vt,at,n`
    .boolean-left ha-selector {
      display: flex;
      justify-content: flex-start;
    }

    /* Color slots section */
    .color-slots-container {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .color-slot {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: 8px;
    }

    .color-slot.dragging {
      opacity: 0.4;
    }

    .color-preview {
      width: 48px;
      height: 48px;
      border-radius: 8px;
      cursor: pointer;
      border: 2px solid var(--divider-color);
      flex-shrink: 0;
    }

    .color-slot-number {
      font-size: 14px;
      font-weight: 600;
      color: var(--primary-color);
      min-width: 20px;
      flex-shrink: 0;
    }

    .brightness-control {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      overflow: hidden;
    }

    .brightness-control ha-selector {
      flex: 1;
      min-width: 80px;
    }

    .brightness-value {
      font-size: 13px;
      color: var(--secondary-text-color);
      min-width: 40px;
      text-align: right;
    }

    .color-slot-actions {
      display: flex;
      gap: 4px;
    }

    .color-slot-actions ha-icon-button {
      --ha-icon-button-size: 32px;
      --mdc-icon-button-size: 32px;
      --mdc-icon-size: 18px;
    }

    .add-color-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px;
      border: 2px dashed var(--divider-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--secondary-text-color);
      transition: all 0.2s ease;
      background: transparent;
    }

    .add-color-btn:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
      background: var(--secondary-background-color);
    }

    .add-color-btn.disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .color-action-buttons {
      display: flex;
      gap: 8px;
    }

    .color-action-buttons .add-color-btn {
      flex: 1;
    }

    .extract-btn {
      border-style: dashed;
    }

    /* Timing sliders */
    .timing-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .timing-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .timing-label {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .timing-value {
      font-size: 13px;
      font-weight: 500;
      color: var(--primary-color);
    }

    /* Distribution section */
    .distribution-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-top: 4px;
    }

    .toggle-label {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    @media (max-width: 600px) {
      .timing-section {
        grid-template-columns: 1fr;
      }

      .color-slots-container {
        gap: 8px;
      }

      .color-slot {
        gap: 8px;
        padding: 8px;
      }

      .color-preview {
        width: 40px;
        height: 40px;
      }

      .color-slot-number {
        min-width: 16px;
        font-size: 13px;
      }

      .brightness-control {
        gap: 4px;
      }

      .brightness-control ha-selector {
        min-width: 60px;
      }

      .color-slot-actions ha-icon-button {
        --ha-icon-button-size: 28px;
        --mdc-icon-button-size: 28px;
        --mdc-icon-size: 16px;
      }
    }
  `],e([pe({attribute:!1})],ui.prototype,"hass",void 0),e([pe({type:Object})],ui.prototype,"preset",void 0),e([pe({type:Object})],ui.prototype,"translations",void 0),e([pe({type:Boolean})],ui.prototype,"editMode",void 0),e([pe({type:Boolean})],ui.prototype,"hasSelectedEntities",void 0),e([pe({type:Boolean})],ui.prototype,"isCompatible",void 0),e([pe({type:Array})],ui.prototype,"selectedEntities",void 0),e([pe({type:Boolean})],ui.prototype,"previewActive",void 0),e([pe({type:Array})],ui.prototype,"colorHistory",void 0),e([pe({type:String})],ui.prototype,"defaultAudioEntity",void 0),e([pe({type:Object})],ui.prototype,"draft",void 0),e([_e()],ui.prototype,"_name",void 0),e([_e()],ui.prototype,"_icon",void 0),e([_e()],ui.prototype,"_steps",void 0),e([_e()],ui.prototype,"_transitionTime",void 0),e([_e()],ui.prototype,"_holdTime",void 0),e([_e()],ui.prototype,"_distributionMode",void 0),e([_e()],ui.prototype,"_offsetDelay",void 0),e([_e()],ui.prototype,"_randomOrder",void 0),e([_e()],ui.prototype,"_loopMode",void 0),e([_e()],ui.prototype,"_loopCount",void 0),e([_e()],ui.prototype,"_endBehavior",void 0),e([_e()],ui.prototype,"_saving",void 0),e([_e()],ui.prototype,"_previewing",void 0),e([_e()],ui.prototype,"_hasUserInteraction",void 0),e([_e()],ui.prototype,"_editingColorIndex",void 0),e([_e()],ui.prototype,"_editingColor",void 0),e([_e()],ui.prototype,"_showExtractor",void 0),e([_e()],ui.prototype,"_extractorMode",void 0),e([_e()],ui.prototype,"_thumbnail",void 0),e([_e()],ui.prototype,"_audioEnabled",void 0),e([_e()],ui.prototype,"_audioEntity",void 0),e([_e()],ui.prototype,"_audioSensitivity",void 0),e([_e()],ui.prototype,"_audioBrightnessCurve",void 0),e([_e()],ui.prototype,"_audioBrightnessMin",void 0),e([_e()],ui.prototype,"_audioBrightnessMax",void 0),e([_e()],ui.prototype,"_audioColorAdvance",void 0),e([_e()],ui.prototype,"_audioTransitionSpeed",void 0),e([_e()],ui.prototype,"_audioDetectionMode",void 0),e([_e()],ui.prototype,"_audioFrequencyZone",void 0),e([_e()],ui.prototype,"_audioSilenceBehavior",void 0),e([_e()],ui.prototype,"_audioPredictionAggressiveness",void 0),e([_e()],ui.prototype,"_audioLatencyCompensationMs",void 0),e([_e()],ui.prototype,"_audioColorByFrequency",void 0),e([_e()],ui.prototype,"_audioRolloffBrightness",void 0),e([_e()],ui.prototype,"_audioModeRegistry",void 0),ui=_i=e([ce("dynamic-scene-editor")],ui);let vi=gi=class extends re{constructor(){super(...arguments),this.narrow=!1,this._loading=!0,this._prefs=new rt(this),this._hasIncompatibleLights=!1,this._favorites=[],this._renamingFavoriteId=null,this._renamingFavoriteName="",this._favoriteEditModeId=null,this._presetEditModeId=null,this._favoriteDrag=null,this._longPressTimer=null,this._activeTab="activate",this._effectPreviewActive=!1,this._patternPreviewActive=!1,this._cctPreviewActive=!1,this._audioModeRegistry=null,this._segmentSequencePreviewActive=!1,this._scenePreviewActive=!1,this._frontendVersion="1.3.2",this._supportedEntities=new Map,this._deviceZones=new Map,this._z2mInstances=[],this._isExporting=!1,this._isImporting=!1,this._isSelectMode=!1,this._selectedPresetIds=new Set,this._runningOperations=[],this._musicSyncEnabled=!1,this._musicSyncSensitivity="low",this._musicSyncEffect="random",this._setupComplete=!0,this._translations=Ht,this._fileInputRef=null,this._eventUnsubscribers=[],this._runningOpsFetchId=0,this._tileCardRef=new Ce,this._tileCards=new Map,this._editorDraftCache={},this._presetLookup=new Map,this._handleColorHistoryChanged=e=>{const t=e.detail;t&&Array.isArray(t.colorHistory)&&(this._prefs.state.colorHistory=t.colorHistory,this._prefs.save(this.hass))},this._handleClearColorHistory=e=>{this._prefs.state.colorHistory=[],this._prefs.save(this.hass,!0)},this._onFavoriteDragStart=(e,t)=>{e.preventDefault(),e.stopPropagation(),this._favoriteDrag={fromId:t,toId:null},e.currentTarget.setPointerCapture(e.pointerId),window.addEventListener("pointermove",this._onFavoriteDragMove),window.addEventListener("pointerup",this._onFavoriteDragEnd),window.addEventListener("pointercancel",this._onFavoriteDragEnd)},this._onFavoriteDragMove=e=>{if(!this._favoriteDrag)return;const t=this.shadowRoot.querySelectorAll(".preset-button[data-fav-id]");for(const i of Array.from(t)){const t=i.getBoundingClientRect();if(e.clientX>=t.left&&e.clientX<=t.right&&e.clientY>=t.top&&e.clientY<=t.bottom){const e=i.dataset.favId;this._favoriteDrag.toId!==e&&(this._favoriteDrag={...this._favoriteDrag,toId:e});break}}},this._suppressClick=e=>{e.preventDefault(),e.stopPropagation()},this._onFavoriteDragEnd=e=>{const t="pointercancel"===e?.type;window.removeEventListener("pointermove",this._onFavoriteDragMove),window.removeEventListener("pointerup",this._onFavoriteDragEnd),window.removeEventListener("pointercancel",this._onFavoriteDragEnd);const i=this._favoriteDrag;if(this._favoriteDrag=null,!i)return;if(t||window.addEventListener("click",this._suppressClick,{capture:!0,once:!0}),!i.toId||i.fromId===i.toId)return;const s=[...this._prefs.state.favoritePresets],o=s.findIndex(e=>e.id===i.fromId),a=s.findIndex(e=>e.id===i.toId);if(o<0||a<0)return;const[n]=s.splice(o,1);n&&(s.splice(a,0,n),this._prefs.update({favoritePresets:s},this.hass))}}_localize(e,t){return it(this._translations,e,t)}firstUpdated(){this._loadPresets(),this._loadFavorites(),this._loadUserPresets(),this._prefs.load(this.hass),this._loadBackendVersion().then(()=>{this._setupComplete&&this._loadSupportedEntities()}),this._loadRunningOperations(),this._subscribeToOperationEvents(),ti(this.hass).then(e=>{null!==e&&(this._audioModeRegistry=e,this.requestUpdate())}),this.addEventListener("color-history-changed",this._handleColorHistoryChanged),this.addEventListener("clear-history",this._handleClearColorHistory)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("color-history-changed",this._handleColorHistoryChanged),this.removeEventListener("clear-history",this._handleClearColorHistory),void 0!==this._runningOpsDebounceTimer&&(clearTimeout(this._runningOpsDebounceTimer),this._runningOpsDebounceTimer=void 0),this._stopSetupPolling(),this._tileCards.clear();for(const e of this._eventUnsubscribers)e();this._eventUnsubscribers=[],this._favoriteDrag&&(window.removeEventListener("pointermove",this._onFavoriteDragMove),window.removeEventListener("pointerup",this._onFavoriteDragEnd),window.removeEventListener("pointercancel",this._onFavoriteDragEnd),this._favoriteDrag=null)}willUpdate(e){super.willUpdate(e),(e.has("_presets")||e.has("_userPresets"))&&(this._cleanStaleFavoriteRefs(),this._rebuildPresetLookup())}_rebuildPresetLookup(){const e=new Map,t=(t,i,s)=>{e.set(t,{name:i,icon:s||null})};if(this._presets?.dynamic_effects)for(const e of Object.values(this._presets.dynamic_effects))for(const i of e)t(i.id,i.name,i.icon);for(const e of this._presets?.segment_patterns||[])t(e.id,e.name,e.icon);for(const e of this._presets?.cct_sequences||[])t(e.id,e.name,e.icon);for(const e of this._presets?.segment_sequences||[])t(e.id,e.name,e.icon);for(const e of this._presets?.dynamic_scenes||[])t(e.id,e.name,e.icon);if(this._userPresets)for(const e of[this._userPresets.effect_presets,this._userPresets.segment_pattern_presets,this._userPresets.cct_sequence_presets,this._userPresets.segment_sequence_presets,this._userPresets.dynamic_scene_presets])for(const i of e||[])t(i.id,i.name,i.icon),t(i.name,i.name,i.icon);this._presetLookup=e}_cleanStaleFavoriteRefs(){if(0===this._prefs.state.favoritePresets.length)return;const e=this._prefs.state.favoritePresets.filter(e=>{switch(e.type){case"effect":for(const t of["t2_bulb","t1m","t1_strip"])if(this._presets?.dynamic_effects?.[t]?.some(t=>t.id===e.id))return!0;return this._userPresets?.effect_presets?.some(t=>t.id===e.id)??!1;case"segment_pattern":return(this._presets?.segment_patterns?.some(t=>t.id===e.id)??!1)||(this._userPresets?.segment_pattern_presets?.some(t=>t.id===e.id)??!1);case"cct_sequence":return(this._presets?.cct_sequences?.some(t=>t.id===e.id)??!1)||(this._userPresets?.cct_sequence_presets?.some(t=>t.id===e.id)??!1);case"segment_sequence":return(this._presets?.segment_sequences?.some(t=>t.id===e.id)??!1)||(this._userPresets?.segment_sequence_presets?.some(t=>t.id===e.id)??!1);case"dynamic_scene":return(this._presets?.dynamic_scenes?.some(t=>t.id===e.id)??!1)||(this._userPresets?.dynamic_scene_presets?.some(t=>t.id===e.id)??!1);default:return!1}});e.length!==this._prefs.state.favoritePresets.length&&(this._prefs.state.favoritePresets=e,this._prefs.save(this.hass))}updated(e){super.updated(e),e.has("hass")&&void 0===e.get("hass")&&(this._loadPresets(),this._loadFavorites(),this._loadUserPresets(),this._prefs.load(this.hass),this._loadSupportedEntities()),this._updateTileCard()}async _updateTileCard(){const e=this._tileCardRef.value;if(!e||!this.hass)return void(this._tileCards.size>0&&this._tileCards.clear());if(!this._prefs.state.selectedEntities.length)return this._tileCards.forEach(e=>{e.parentElement&&e.remove()}),void this._tileCards.clear();await customElements.whenDefined("hui-tile-card");const t=new Set(this._prefs.state.selectedEntities);for(const[i,s]of this._tileCards.entries())t.has(i)&&s.parentElement===e||(s.parentElement&&s.remove(),this._tileCards.delete(i));for(const t of this._prefs.state.selectedEntities){let i=this._tileCards.get(t);i&&i.parentElement===e||(i=document.createElement("hui-tile-card"),e.appendChild(i),this._tileCards.set(t,i));try{i.setConfig({type:"tile",entity:t,features:[{type:"light-brightness"}]}),i.hass=this.hass}catch(e){}}}async _loadPresets(){if(this.hass)try{this._presets=await async function(e,t={}){return t.bypassCache&&Jt("presets"),Qt("presets",Yt,async()=>{const t=await e.fetchWithAuth("/api/aqara_advanced_lighting/presets");if(!t.ok)throw new Error(`Presets fetch failed: ${t.status}`);return t.json()})}(this.hass),this._loading=!1}catch(e){this._error=e instanceof Error?e.message:this._localize("errors.loading_presets_generic"),this._loading=!1}}async _loadFavorites(){if(this.hass)try{const e=await this.hass.callApi("GET","aqara_advanced_lighting/favorites");this._favorites=e.favorites||[]}catch(e){}}async _loadUserPresets(e={}){if(this.hass)try{this._userPresets=await async function(e,t={}){return t.bypassCache&&Jt("user_presets"),Qt("user_presets",12e4,()=>e.callApi("GET","aqara_advanced_lighting/user_presets"))}(this.hass,e)}catch(e){}}_isPresetFavorited(e,t){return this._prefs.state.favoritePresets.some(i=>i.type===e&&i.id===t)}_toggleFavoritePreset(e,t,i){i.stopPropagation();const s=this._prefs.state.favoritePresets.findIndex(i=>i.type===e&&i.id===t);this._prefs.state.favoritePresets=s>=0?[...this._prefs.state.favoritePresets.slice(0,s),...this._prefs.state.favoritePresets.slice(s+1)]:[...this._prefs.state.favoritePresets,{type:e,id:t}],this._prefs.save(this.hass,!0),this.requestUpdate()}_renderFavoriteStar(e,t){const i=this._isPresetFavorited(e,t);return N`
      <ha-icon-button
        class="favorite-star ${i?"favorited":""}"
        @click=${i=>this._toggleFavoritePreset(e,t,i)}
        title="${i?this._localize("tooltips.favorite_preset_remove"):this._localize("tooltips.favorite_preset_add")}"
      >
        <ha-icon icon="${i?"mdi:star":"mdi:star-outline"}"></ha-icon>
      </ha-icon-button>
    `}_isBuiltinPresetHidden(e,t){return this._prefs.state.hiddenBuiltinPresets.some(i=>i.type===e&&i.id===t)}_hideBuiltinPreset(e,t,i){i.stopPropagation(),this._isBuiltinPresetHidden(e,t)||(this._prefs.state.hiddenBuiltinPresets=[...this._prefs.state.hiddenBuiltinPresets,{type:e,id:t}]);const s=this._prefs.state.favoritePresets.findIndex(i=>i.type===e&&i.id===t);s>=0&&(this._prefs.state.favoritePresets=[...this._prefs.state.favoritePresets.slice(0,s),...this._prefs.state.favoritePresets.slice(s+1)]),this._prefs.save(this.hass,!0),this.requestUpdate(),this._showToast(this._localize("presets.preset_hidden"))}_restoreAllHiddenPresets(){0!==this._prefs.state.hiddenBuiltinPresets.length&&(this._prefs.state.hiddenBuiltinPresets=[],this._prefs.save(this.hass,!0),this.requestUpdate(),this._showToast(this._localize("presets.presets_restored")))}_renderHideButton(e,t){return N`
      <div class="preset-card-actions preset-card-actions-right">
        <ha-icon-button
          @click=${i=>this._hideBuiltinPreset(e,t,i)}
          title="${this._localize("tooltips.preset_hide")}"
        >
          <ha-icon icon="mdi:eye-off-outline"></ha-icon>
        </ha-icon-button>
      </div>
    `}async _activateFavoritePreset(e,t,i){switch(e.type){case"effect":i?await this._activateUserEffectPreset(t):await this._activateDynamicEffect(t);break;case"segment_pattern":i?await this._activateUserPatternPreset(t):await this._activateSegmentPattern(t);break;case"cct_sequence":i?await this._activateUserCCTSequencePreset(t):await this._activateCCTSequence(t);break;case"segment_sequence":i?await this._activateUserSegmentSequencePreset(t):await this._activateSegmentSequence(t);break;case"dynamic_scene":i?await this._activateUserDynamicScenePreset(t):await this._activateDynamicScene(t)}}_getSortPreference(e){return this._prefs.getSortPreference(e)}async _loadBackendVersion(){try{const e=await fetch("/api/aqara_advanced_lighting/version");if(!e.ok)return;const t=await e.json();this._backendVersion=t.version,this._setupComplete=t.setup_complete??!0,this._setupComplete||this._setupPollTimer||this._startSetupPolling()}catch(e){}}_startSetupPolling(){this._setupPollTimer=setInterval(()=>this._checkSetupStatus(),2500)}async _checkSetupStatus(){try{const e=await fetch("/api/aqara_advanced_lighting/version");if(!e.ok)return;const t=await e.json();this._setupComplete=t.setup_complete??!0,this._setupComplete&&(this._stopSetupPolling(),this._loadSupportedEntities())}catch(e){}}_stopSetupPolling(){this._setupPollTimer&&(clearInterval(this._setupPollTimer),this._setupPollTimer=void 0)}async _loadSupportedEntities(){if(this.hass)try{const e=await async function(e,t={}){return t.bypassCache&&Jt("supported_entities"),Qt("supported_entities",Yt,()=>e.callApi("GET","aqara_advanced_lighting/supported_entities"))}(this.hass),t=new Map;for(const i of e.entities||[])t.set(i.entity_id,{device_type:i.device_type,model_id:i.model_id,z2m_friendly_name:i.z2m_friendly_name,ieee_address:i.ieee_address,segment_count:i.segment_count});for(const i of e.light_groups||[])t.set(i.entity_id,{device_type:i.device_type,model_id:"light_group",z2m_friendly_name:i.friendly_name,is_group:!0,member_count:i.member_count});this._supportedEntities=t,this._prefs.state.selectedEntities.length>0&&this._loadZonesForSelectedDevices(),this._z2mInstances=e.instances||[]}catch(e){}}_scheduleLoadRunningOperations(){void 0!==this._runningOpsDebounceTimer&&clearTimeout(this._runningOpsDebounceTimer),this._runningOpsDebounceTimer=setTimeout(()=>{this._runningOpsDebounceTimer=void 0,this._loadRunningOperations()},100)}async _loadRunningOperations(){if(!this.hass)return;const e=++this._runningOpsFetchId;try{const t=await this.hass.callApi("GET","aqara_advanced_lighting/running_operations");if(e!==this._runningOpsFetchId)return;this._runningOperations=t.operations||[],this._syncMusicSyncState()}catch(e){}}_syncMusicSyncState(){const e=this._runningOperations.find(e=>"music_sync"===e.type&&e.entity_id&&this._prefs.state.selectedEntities.includes(e.entity_id));e?(this._musicSyncEnabled=!0,e.sensitivity&&(this._musicSyncSensitivity=e.sensitivity),e.audio_effect&&(this._musicSyncEffect=e.audio_effect)):this._musicSyncEnabled=!1}async _subscribeToOperationEvents(){if(!this.hass?.connection)return;const e=["aqara_advanced_lighting_sequence_started","aqara_advanced_lighting_sequence_stopped","aqara_advanced_lighting_sequence_completed","aqara_advanced_lighting_sequence_paused","aqara_advanced_lighting_sequence_resumed","aqara_advanced_lighting_dynamic_scene_started","aqara_advanced_lighting_dynamic_scene_stopped","aqara_advanced_lighting_dynamic_scene_finished","aqara_advanced_lighting_dynamic_scene_paused","aqara_advanced_lighting_dynamic_scene_resumed","aqara_advanced_lighting_effect_activated","aqara_advanced_lighting_effect_stopped","aqara_advanced_lighting_entity_externally_controlled","aqara_advanced_lighting_entity_control_resumed"];for(const t of e)try{const e=await this.hass.connection.subscribeEvents(()=>{this._scheduleLoadRunningOperations()},t);this._eventUnsubscribers.push(e)}catch(e){}}_getSelectedSegmentDevices(){const e=new Map;for(const t of this._prefs.state.selectedEntities){const i=this._supportedEntities.get(t);if(!i?.ieee_address)continue;if("t1m"!==i.device_type&&"t1_strip"!==i.device_type)continue;if(e.has(i.ieee_address))continue;const s="t1_strip"===i.device_type?this._getT1StripSegmentCount():i.segment_count||0;0!==s&&e.set(i.ieee_address,{device_type:i.device_type,segment_count:s,z2m_friendly_name:i.z2m_friendly_name,entity_id:t})}return e}async _loadZonesForDevice(e){if(this.hass)try{const t=await this.hass.callApi("GET",`aqara_advanced_lighting/segment_zones/${encodeURIComponent(e)}`),i=Object.entries(t.zones||{}).map(([e,t])=>({name:e,segments:t}));this._deviceZones=new Map(this._deviceZones).set(e,i)}catch(e){}}async _loadZonesForSelectedDevices(){const e=this._getSelectedSegmentDevices();await Promise.all(Array.from(e.keys()).map(e=>this._loadZonesForDevice(e)))}_setSortPreference(e,t){this._prefs.setSortPreference(e,t,this.hass)}_sortPresets(e,t){const i=[...e];switch(t){case"name-asc":return i.sort((e,t)=>e.name.localeCompare(t.name));case"name-desc":return i.sort((e,t)=>t.name.localeCompare(e.name));case"date-new":return i.length>0&&i[0]?.created_at?i.sort((e,t)=>new Date(t.created_at).getTime()-new Date(e.created_at).getTime()):i.sort((e,t)=>e.name.localeCompare(t.name));case"date-old":return i.length>0&&i[0]?.created_at?i.sort((e,t)=>new Date(e.created_at).getTime()-new Date(t.created_at).getTime()):i.sort((e,t)=>e.name.localeCompare(t.name));default:return i}}_sortResolvedFavorites(e,t){const i=[...e];switch(t){case"custom":case"date-old":default:return i;case"name-asc":return i.sort((e,t)=>e.preset.name.localeCompare(t.preset.name));case"name-desc":return i.sort((e,t)=>t.preset.name.localeCompare(e.preset.name));case"date-new":return i.reverse()}}_groupPresetsByDeviceType(e){const t=[],i=new Map;for(const s of e)if(s.device_type){const e=i.get(s.device_type)||[];e.push(s),i.set(s.device_type,e)}else t.push(s);return{ungrouped:t,grouped:i}}async _saveUserPreset(e,t){if(this.hass)try{await this.hass.callApi("POST","aqara_advanced_lighting/user_presets",{type:e,data:t}),await this._loadUserPresets({bypassCache:!0})}catch(e){}}async _updateUserPreset(e,t,i){if(this.hass)try{await this.hass.callApi("PUT",`aqara_advanced_lighting/user_presets/${e}/${t}`,i),await this._loadUserPresets({bypassCache:!0})}catch(e){}}async _deleteUserPreset(e,t){if(this.hass)try{await this.hass.callApi("DELETE",`aqara_advanced_lighting/user_presets/${e}/${t}`),await this._loadUserPresets({bypassCache:!0})}catch(e){}}_setActiveTab(e){e!==this._activeTab&&(this._cacheCurrentEditorDraft(),this._isSelectMode&&this._exitSelectMode()),this._activeTab=e}_handleTabChange(e){const t=e.detail.name;t&&this._setActiveTab(t)}_cacheCurrentEditorDraft(){const e={effects:"effect-editor",patterns:"pattern-editor",cct:"cct-sequence-editor",segments:"segment-sequence-editor",scenes:"dynamic-scene-editor"}[this._activeTab];if(!e)return;const t=this.shadowRoot?.querySelector(e);if(t&&"function"==typeof t.getDraftState){const e=t.getDraftState();if(e){const t=this._activeTab;this._editorDraftCache={...this._editorDraftCache,[t]:e}}}}_getEditorDraft(e){const t=e,i=this._editorDraftCache[t];if(i){const{[t]:e,...i}=this._editorDraftCache;this._editorDraftCache=i}return i}_clearEditorDraft(e){if(e){const t=e,{[t]:i,...s}=this._editorDraftCache;this._editorDraftCache=s}else this._editorDraftCache={}}async _addFavorite(){if(!this._prefs.state.selectedEntities.length||!this.hass)return;const e=this._prefs.state.selectedEntities[0],t=1===this._prefs.state.selectedEntities.length&&e?this._getEntityFriendlyName(e):this._localize("target.lights_count",{count:this._prefs.state.selectedEntities.length.toString()});try{const e=await this.hass.callApi("POST","aqara_advanced_lighting/favorites",{entities:this._prefs.state.selectedEntities,name:t});this._favorites=[...this._favorites,e.favorite]}catch(e){}}async _removeFavorite(e){if(this.hass)try{await this.hass.callApi("DELETE",`aqara_advanced_lighting/favorites/${e}`),this._favorites=this._favorites.filter(t=>t.id!==e)}catch(e){}}_startRenameFavorite(e,t){e.stopPropagation(),this._favoriteEditModeId=null,this._renamingFavoriteId=t.id,this._renamingFavoriteName=t.name,this.updateComplete.then(()=>{const e=this.shadowRoot?.querySelector(".favorite-rename-input");e&&(e.focus(),e.select())})}_handleRenameInput(e){this._renamingFavoriteName=e.target.value}_handleRenameKeydown(e){"Enter"===e.key?(e.preventDefault(),this._saveRenameFavorite()):"Escape"===e.key&&(e.preventDefault(),this._cancelRenameFavorite())}async _saveRenameFavorite(){if(this.hass&&this._renamingFavoriteId&&this._renamingFavoriteName.trim()){try{const e=await this.hass.callApi("PUT",`aqara_advanced_lighting/favorites/${this._renamingFavoriteId}`,{name:this._renamingFavoriteName.trim()});this._favorites=this._favorites.map(t=>t.id===this._renamingFavoriteId?e.favorite:t)}catch(e){}this._cancelRenameFavorite()}else this._cancelRenameFavorite()}_handleRenameBlur(){setTimeout(()=>{this._renamingFavoriteId&&this._saveRenameFavorite()},150)}_cancelRenameFavorite(){this._renamingFavoriteId=null,this._renamingFavoriteName=""}_handleFavoriteTouchStart(e){this._longPressTimer=setTimeout(()=>{this._longPressTimer=null,this._favoriteEditModeId=e.id},500)}_handleFavoriteTouchEnd(e){this._longPressTimer?(clearTimeout(this._longPressTimer),this._longPressTimer=null):e.preventDefault()}_handleFavoriteTouchMove(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_clearFavoriteEditMode(){this._favoriteEditModeId=null}_handlePresetTouchStart(e){this._longPressTimer=setTimeout(()=>{this._longPressTimer=null,this._presetEditModeId=e},500)}_handlePresetTouchEnd(e){this._longPressTimer?(clearTimeout(this._longPressTimer),this._longPressTimer=null):e.preventDefault()}_handlePresetTouchMove(){this._longPressTimer&&(clearTimeout(this._longPressTimer),this._longPressTimer=null)}_selectFavorite(e){this._prefs.update({selectedEntities:[...e.entities],activeFavoriteId:e.id},this.hass),this._favoriteEditModeId=null,this._loadZonesForSelectedDevices()}_getEntityFriendlyName(e){return this.hass?lt(this.hass,e):e}_getEntityIcon(e){return this.hass?ct(this.hass,e):"mdi:lightbulb"}_getEntityState(e){return this.hass?function(e,t){const i=e.states[t];return i?i.state:"unavailable"}(this.hass,e):"unavailable"}_getEntityColor(e){return this.hass?function(e,t){const i=e.states[t];if(!i||"on"!==i.state)return null;if(i.attributes.rgb_color){const[e,t,s]=i.attributes.rgb_color;return`rgb(${e}, ${t}, ${s})`}if(i.attributes.hs_color&&Array.isArray(i.attributes.hs_color)){const e=i.attributes.hs_color;if(e.length>=2&&"number"==typeof e[0]&&"number"==typeof e[1]){const t=Ne(e[0],e[1]);return`rgb(${t.r}, ${t.g}, ${t.b})`}}return null}(this.hass,e):null}_getSelectedDeviceTypes(){if(!this._prefs.state.selectedEntities.length||!this.hass)return this._hasIncompatibleLights=!1,[];const e=new Set;let t=!1;for(const i of this._prefs.state.selectedEntities){const s=this._getEntityDeviceType(i);s?e.add(s):t=!0}return this._hasIncompatibleLights=t&&!e.has("generic_rgb")&&!e.has("generic_cct"),Array.from(e)}_getT1StripSegmentCount(){if(!this._prefs.state.selectedEntities.length||!this.hass)return 10;for(const e of this._prefs.state.selectedEntities){if("t1_strip"!==this._getEntityDeviceType(e))continue;const t=this.hass.states[e];if(!t)continue;let i;const s=t.attributes.length;if(s&&"number"==typeof s&&s>0&&(i=s),void 0===i){const t=e.split(".")[1]||"";for(const e of["number","sensor"]){const s=`${e}.${t}_length`,o=this.hass.states[s];if(o&&o.state&&"unknown"!==o.state&&"unavailable"!==o.state){const e=parseFloat(o.state);if(!isNaN(e)&&e>0){i=e;break}}}}if(void 0!==i&&i>0)return Math.floor(5*i)}return 10}_getDeviceContextForEditor(e){const t=this._getSelectedDeviceTypes();if(0===t.length)return{deviceType:null,hasSelection:!1};let i=null;switch(e){case"effect":i=t.find(e=>"t2_bulb"===e||"t1m"===e||"t1_strip"===e||"t1"===e)??null;break;case"pattern":case"segment":i=t.find(e=>"t1m"===e||"t1_strip"===e||"t1"===e)??null;break;case"cct":i=t[0]??null}return{deviceType:i,hasSelection:!0,zones:this._getResolvedZonesForSelection()}}_getResolvedZonesForSelection(){for(const e of this._prefs.state.selectedEntities){const t=this._supportedEntities.get(e);if(!t?.ieee_address)continue;if("t1m"!==t.device_type&&"t1_strip"!==t.device_type)continue;const i="t1_strip"===t.device_type?this._getT1StripSegmentCount():t.segment_count||0;if(0===i)continue;return(this._deviceZones.get(t.ieee_address)||[]).map(e=>{const t=[];for(const s of e.segments.split(",")){const e=s.trim(),o=e.match(/^(\d+)-(\d+)$/);if(o&&o[1]&&o[2]){const e=parseInt(o[1],10),s=parseInt(o[2],10);for(let o=e;o<=s&&o<=i;o++)t.push(o-1)}else{const s=parseInt(e,10);!isNaN(s)&&s>=1&&s<=i&&t.push(s-1)}}return{name:e.name,segmentIndices:t}})}return[]}_hasRGBColorMode(e){return dt(e)}_getEntityDeviceType(e){return this.hass?ht(this.hass,e,this._supportedEntities,this._prefs.state.includeAllLights):null}_isEffectsCompatible(){return this._getEffectsCompatibleEntities().length>0}_isPatternsCompatible(){return this._getPatternsCompatibleEntities().length>0}_isCCTCompatible(){return this._getCCTCompatibleEntities().length>0}_isSegmentsCompatible(){return this._getSegmentsCompatibleEntities().length>0}_getEffectsCompatibleEntities(){return this.hass?this._prefs.state.selectedEntities.filter(e=>{if(!this._supportedEntities.has(e))return!1;const t=this._getEntityDeviceType(e);return"t2_bulb"===t||"t1m"===t||"t1_strip"===t}):[]}_getPatternsCompatibleEntities(){return this.hass?this._prefs.state.selectedEntities.filter(e=>{if(!this._supportedEntities.has(e))return!1;const t=this._getEntityDeviceType(e);return"t1m"===t||"t1_strip"===t}):[]}_getCCTCompatibleEntities(){return this.hass?this._prefs.state.selectedEntities.filter(e=>{const t=this.hass.states[e];if(!t)return!1;if(!(void 0!==t.attributes.color_temp_kelvin||void 0!==t.attributes.min_color_temp_kelvin))return!1;return"t1m"!==this._getEntityDeviceType(e)}):[]}_getSegmentsCompatibleEntities(){return this.hass?this._prefs.state.selectedEntities.filter(e=>{if(!this._supportedEntities.has(e))return!1;const t=this._getEntityDeviceType(e);return"t1m"===t||"t1_strip"===t}):[]}_filterPresets(){const e=Nt(this._getSelectedDeviceTypes());return{...e,t2Presets:e.hasT2&&this._presets?.dynamic_effects.t2_bulb||[],t1mPresets:e.hasT1M&&this._presets?.dynamic_effects.t1m||[],t1StripPresets:e.hasT1Strip&&this._presets?.dynamic_effects.t1_strip||[]}}_handleEntityChanged(e){const t=e.detail.value;if(!t)return void this._prefs.update({selectedEntities:[],activeFavoriteId:null},this.hass);const i=Array.isArray(t)?t:[t];this._prefs.update({selectedEntities:i,activeFavoriteId:null},this.hass),this._clearEditorDraft(),this._loadZonesForSelectedDevices()}_handleIncludeAllLightsToggle(e){const t=e.target.checked;if(this._prefs.update({includeAllLights:t},this.hass),!t){const e=new Set(this._supportedEntities.keys()),t=this._prefs.state.selectedEntities.filter(t=>e.has(t));t.length!==this._prefs.state.selectedEntities.length&&(this._prefs.state.selectedEntities=t,this.requestUpdate())}}_handleBrightnessChange(e){this._prefs.update({brightness:e.detail.value},this.hass)}_handleCustomBrightnessToggle(e){this._prefs.update({useCustomBrightness:e.target.checked},this.hass)}_handleStaticSceneModeToggle(e){this._prefs.update({useStaticSceneMode:e.target.checked},this.hass)}_handleIgnoreExternalChangesToggle(e){this._prefs.state.ignoreExternalChanges=e.target.checked,this.requestUpdate(),this._prefs.saveGlobalPreferences(this.hass)}_handleOverrideControlModeChanged(e){this._prefs.state.overrideControlMode=e.detail.value,this.requestUpdate(),this._prefs.saveGlobalPreferences(this.hass)}_handleBareTurnOnOnlyToggle(e){this._prefs.state.bareTurnOnOnly=e.target.checked,this.requestUpdate(),this._prefs.saveGlobalPreferences(this.hass)}_handleDetectNonHaChangesToggle(e){this._prefs.state.detectNonHaChanges=e.target.checked,this.requestUpdate(),this._prefs.saveGlobalPreferences(this.hass)}_handleDistributionModeOverrideToggle(e){this._prefs.update({useDistributionModeOverride:e.target.checked},this.hass)}_handleDistributionModeOverrideChange(e){this._prefs.update({distributionModeOverride:e.detail.value||"shuffle_rotate"},this.hass)}_handleAudioReactiveToggle(e){e.target.checked?this._prefs.update({useAudioReactive:!0,useCustomBrightness:!1,useStaticSceneMode:!1,useDistributionModeOverride:!1},this.hass):this._prefs.update({useAudioReactive:!1},this.hass)}_handleEffectAudioReactiveToggle(e){e.target.checked?this._prefs.update({useEffectAudioReactive:!0,useCustomBrightness:!1},this.hass):this._prefs.update({useEffectAudioReactive:!1},this.hass)}_handleAudioOverrideEntityChange(e){this._prefs.update({audioOverrideEntity:e.detail.value||""},this.hass)}_handleAudioOverrideSensitivityChange(e){this._prefs.update({audioOverrideSensitivity:e.detail.value??50},this.hass)}_handleAudioOverrideColorAdvanceChange(e){this._prefs.update({audioOverrideColorAdvance:e.detail.value||"on_onset"},this.hass)}_handleAudioOverrideDetectionModeChange(e){this._prefs.update({audioOverrideDetectionMode:e.detail.value||"spectral_flux"},this.hass)}_handleAudioOverridePredictionAggressivenessChange(e){this._prefs.update({audioOverridePredictionAggressiveness:e.detail.value??50},this.hass)}_handleAudioOverrideLatencyCompensationChange(e){this._prefs.update({audioOverrideLatencyCompensationMs:e.detail.value??150},this.hass)}_handleAudioOverrideTransitionSpeedChange(e){this._prefs.update({audioOverrideTransitionSpeed:e.detail.value??50},this.hass)}get _currentAudioOverridePreset(){for(const[e,t]of Object.entries(gi.AUDIO_PRESETS))if(this._prefs.state.audioOverrideColorAdvance===t.color_advance&&this._prefs.state.audioOverrideDetectionMode===t.detection_mode&&this._prefs.state.audioOverrideSensitivity===t.sensitivity&&this._prefs.state.audioOverrideTransitionSpeed===t.transition_speed&&this._prefs.state.audioOverrideBrightnessCurve===t.brightness_curve&&this._prefs.state.audioOverrideBrightnessMin===t.brightness_min&&this._prefs.state.audioOverrideBrightnessMax===t.brightness_max&&this._prefs.state.audioOverrideFrequencyZone===t.frequency_zone&&this._prefs.state.audioOverrideColorByFrequency===t.color_by_frequency&&this._prefs.state.audioOverrideRolloffBrightness===t.rolloff_brightness&&this._prefs.state.audioOverrideSilenceBehavior===t.silence_behavior&&this._prefs.state.audioOverridePredictionAggressiveness===t.prediction_aggressiveness&&this._prefs.state.audioOverrideLatencyCompensationMs===t.latency_compensation_ms)return e;return"custom"}get _audioPresetOptions(){return[{value:"beat",label:this._localize("dynamic_scene.audio_preset_beat")||"Beat"},{value:"ambient",label:this._localize("dynamic_scene.audio_preset_ambient")||"Ambient"},{value:"concert",label:this._localize("dynamic_scene.audio_preset_concert")||"Concert"},{value:"chill",label:this._localize("dynamic_scene.audio_preset_chill")||"Chill"},{value:"club",label:this._localize("dynamic_scene.audio_preset_club")||"Club"},{value:"custom",label:this._localize("dynamic_scene.audio_preset_custom")||"Custom"}]}_handleAudioOverridePresetChange(e){const t=e.detail.value;if("custom"===t)return;const i=gi.AUDIO_PRESETS[t];i&&this._prefs.update({audioOverrideColorAdvance:i.color_advance,audioOverrideDetectionMode:i.detection_mode,audioOverrideSensitivity:i.sensitivity,audioOverrideTransitionSpeed:i.transition_speed,audioOverrideBrightnessCurve:i.brightness_curve,audioOverrideBrightnessMin:i.brightness_min,audioOverrideBrightnessMax:i.brightness_max,audioOverrideFrequencyZone:i.frequency_zone,audioOverrideColorByFrequency:i.color_by_frequency,audioOverrideRolloffBrightness:i.rolloff_brightness,audioOverrideSilenceBehavior:i.silence_behavior,audioOverridePredictionAggressiveness:i.prediction_aggressiveness,audioOverrideLatencyCompensationMs:i.latency_compensation_ms},this.hass)}get _distributionModeOverrideOptions(){return[{value:"shuffle_rotate",label:this._localize("dynamic_scene.distribution_shuffle_rotate")||"Shuffle and rotate"},{value:"synchronized",label:this._localize("dynamic_scene.distribution_synchronized")||"Synchronized"},{value:"random",label:this._localize("dynamic_scene.distribution_random")||"Random"}]}_applyGlobalPreferencesFromConfigTab(e){"software_transition_entities"in e&&(this._prefs.state.softwareTransitionEntities=e.software_transition_entities),"entity_audio_config"in e&&(this._prefs.state.entityAudioConfig=e.entity_audio_config),this.requestUpdate(),this._prefs.saveGlobalPreferences(this.hass)}_handleExpansionChange(e,t){this._prefs.setCollapsed(e,!t.detail.expanded,this.hass)}async _activateDynamicEffect(e){if(!this._prefs.state.selectedEntities.length)return;const t={entity_id:this._prefs.state.selectedEntities,preset:e.id,turn_on:!0,sync:!0};if(this._prefs.state.useCustomBrightness&&(t.brightness=this._prefs.state.brightness),this._prefs.state.useEffectAudioReactive)this._prefs.state.audioOverrideEntity&&(t.audio_entity=this._prefs.state.audioOverrideEntity,t.audio_sensitivity=e.audio_sensitivity??this._prefs.state.effectAudioOverrideSensitivity,t.audio_silence_behavior=e.audio_silence_behavior??"decay_min",t.audio_speed_mode=e.audio_speed_mode||"volume",void 0!==e.audio_speed_min&&(t.audio_speed_min=e.audio_speed_min),void 0!==e.audio_speed_max&&(t.audio_speed_max=e.audio_speed_max));else if(e.audio_speed_mode){const e=this._prefs.state.audioOverrideEntity;e&&(t.audio_entity=e)}await this.hass.callService("aqara_advanced_lighting","set_dynamic_effect",t),await this._loadRunningOperations()}async _activateSegmentPattern(e){if(!this._prefs.state.selectedEntities.length)return;const t={entity_id:this._prefs.state.selectedEntities,preset:e.id,turn_on:!0,sync:!0};this._prefs.state.useCustomBrightness&&(t.brightness=this._prefs.state.brightness),await this.hass.callService("aqara_advanced_lighting","set_segment_pattern",t),await this._loadRunningOperations()}async _activateCCTSequence(e){if(!this._prefs.state.selectedEntities.length)return;const t="solar"===e.mode||"schedule"===e.mode;await this.hass.callService("aqara_advanced_lighting","start_cct_sequence",{entity_id:this._prefs.state.selectedEntities,preset:e.id,...!t&&{turn_on:!0},sync:!0}),await this._loadRunningOperations()}async _activateSegmentSequence(e){if(!this._prefs.state.selectedEntities.length)return;const t={entity_id:this._prefs.state.selectedEntities,preset:e.id,turn_on:!0,sync:!0};this._prefs.state.useCustomBrightness&&(t.brightness=this._prefs.state.brightness),await this.hass.callService("aqara_advanced_lighting","start_segment_sequence",t),await this._loadRunningOperations()}async _activateDynamicScene(e){if(!this._prefs.state.selectedEntities.length)return;const t=this._prefs.state.useCustomBrightness?this._prefs.state.brightness:null,i={entity_id:this._prefs.state.selectedEntities,scene_name:e.name,transition_time:e.transition_time,hold_time:e.hold_time,distribution_mode:this._prefs.state.useDistributionModeOverride?this._prefs.state.distributionModeOverride:e.distribution_mode,random_order:e.random_order,loop_mode:e.loop_mode,end_behavior:e.end_behavior};void 0!==e.offset_delay&&e.offset_delay>0&&(i.offset_delay=e.offset_delay),"count"===e.loop_mode&&void 0!==e.loop_count&&(i.loop_count=e.loop_count),i.colors=e.colors.map(e=>({x:e.x,y:e.y,brightness_pct:t??e.brightness_pct})),this._prefs.state.useStaticSceneMode&&(i.static=!0),this._applyAudioOverrides(i),this._applyPresetAudioFields(i,e),await this.hass.callService("aqara_advanced_lighting","start_dynamic_scene",i),await this._loadRunningOperations()}_applyPresetAudioFields(e,t){if(this._prefs.state.useAudioReactive&&this._prefs.state.audioOverrideEntity)return;if(!t.audio_color_advance)return;const i=t.audio_entity||this._prefs.state.audioOverrideEntity;i&&(e.audio_entity=i,e.audio_color_advance=t.audio_color_advance,null!=t.audio_sensitivity&&(e.audio_sensitivity=t.audio_sensitivity),void 0!==t.audio_brightness_curve&&(e.audio_brightness_curve=t.audio_brightness_curve),null!=t.audio_brightness_min&&(e.audio_brightness_min=t.audio_brightness_min),null!=t.audio_brightness_max&&(e.audio_brightness_max=t.audio_brightness_max),null!=t.audio_transition_speed&&(e.audio_transition_speed=t.audio_transition_speed),null!=t.audio_detection_mode&&(e.audio_detection_mode=t.audio_detection_mode),null!=t.audio_frequency_zone&&(e.audio_frequency_zone=t.audio_frequency_zone),null!=t.audio_silence_behavior&&(e.audio_silence_behavior=t.audio_silence_behavior),null!=t.audio_prediction_aggressiveness&&(e.audio_prediction_aggressiveness=t.audio_prediction_aggressiveness),null!=t.audio_latency_compensation_ms&&(e.audio_latency_compensation_ms=t.audio_latency_compensation_ms),null!=t.audio_color_by_frequency&&(e.audio_color_by_frequency=t.audio_color_by_frequency),null!=t.audio_rolloff_brightness&&(e.audio_rolloff_brightness=t.audio_rolloff_brightness))}_applyAudioOverrides(e){this._prefs.state.useAudioReactive&&this._prefs.state.audioOverrideEntity&&(e.audio_entity=this._prefs.state.audioOverrideEntity,e.audio_sensitivity=this._prefs.state.audioOverrideSensitivity,e.audio_color_advance=this._prefs.state.audioOverrideColorAdvance,e.audio_transition_speed=this._prefs.state.audioOverrideTransitionSpeed,e.audio_brightness_curve=this._prefs.state.audioOverrideBrightnessCurve,e.audio_brightness_min=this._prefs.state.audioOverrideBrightnessMin,e.audio_brightness_max=this._prefs.state.audioOverrideBrightnessMax,e.audio_detection_mode=this._prefs.state.audioOverrideDetectionMode,e.audio_frequency_zone=this._prefs.state.audioOverrideFrequencyZone,e.audio_silence_behavior=this._prefs.state.audioOverrideSilenceBehavior,e.audio_prediction_aggressiveness=this._prefs.state.audioOverridePredictionAggressiveness,e.audio_latency_compensation_ms=this._prefs.state.audioOverrideLatencyCompensationMs)}_filterByDeviceType(e,t){return e.filter(e=>!e.device_type||("t1m"===t&&("t1"===e.device_type||"t1m"===e.device_type)||e.device_type===t))}_getUserEffectPresetsForDeviceType(e){return this._filterByDeviceType(this._userPresets?.effect_presets||[],e)}_getUserPatternPresetsForDeviceType(e){return this._filterByDeviceType(this._userPresets?.segment_pattern_presets||[],e)}_getFilteredUserCCTSequencePresets(){if(!this._userPresets?.cct_sequence_presets)return[];return this._getSelectedDeviceTypes().length>0?this._userPresets.cct_sequence_presets:[]}_getUserSegmentSequencePresetsForDeviceType(e){return this._filterByDeviceType(this._userPresets?.segment_sequence_presets||[],e)}_getFilteredUserDynamicScenePresets(){if(!this._userPresets?.dynamic_scene_presets)return[];return this._getSelectedDeviceTypes().length>0?this._userPresets.dynamic_scene_presets:[]}async _activateUserEffectPreset(e){if(!this._prefs.state.selectedEntities.length)return;const t={entity_id:this._prefs.state.selectedEntities,effect:e.effect,speed:e.effect_speed,preset:e.name,turn_on:!0,sync:!0};if(e.effect_colors.forEach((e,i)=>{i<8&&(t[`color_${i+1}`]={x:e.x,y:e.y})}),void 0!==e.effect_brightness?t.brightness=e.effect_brightness:this._prefs.state.useCustomBrightness&&(t.brightness=this._prefs.state.brightness),e.effect_segments&&(t.segments=e.effect_segments),this._prefs.state.useEffectAudioReactive){if(this._prefs.state.audioOverrideEntity){const i=e.audio_config;t.audio_entity=this._prefs.state.audioOverrideEntity,t.audio_sensitivity=i?.audio_sensitivity??this._prefs.state.effectAudioOverrideSensitivity,t.audio_silence_behavior=i?.audio_silence_behavior??"decay_min",t.audio_speed_mode=i?.audio_speed_mode||"volume",void 0!==i?.audio_speed_min&&(t.audio_speed_min=i.audio_speed_min),void 0!==i?.audio_speed_max&&(t.audio_speed_max=i.audio_speed_max)}}else if(e.audio_config?.audio_entity){const i=e.audio_config,s=i.audio_entity||this._prefs.state.audioOverrideEntity;s&&(t.audio_entity=s,t.audio_sensitivity=i.audio_sensitivity??50,t.audio_silence_behavior=i.audio_silence_behavior??"decay_min",i.audio_speed_mode&&(t.audio_speed_mode=i.audio_speed_mode,t.audio_speed_min=i.audio_speed_min??1,t.audio_speed_max=i.audio_speed_max??100))}await this.hass.callService("aqara_advanced_lighting","set_dynamic_effect",t),await this._loadRunningOperations()}async _activateUserPatternPreset(e){if(!this._prefs.state.selectedEntities.length)return;if(!e.segments||!Array.isArray(e.segments)||0===e.segments.length)return;const t=e.segments.filter(e=>e&&e.color).map(e=>({segment:e.segment,color:{r:e.color.r,g:e.color.g,b:e.color.b}}));if(0===t.length)return;const i={entity_id:this._prefs.state.selectedEntities,segment_colors:t,preset:e.name,turn_on:!0,sync:!0,turn_off_unspecified:!0};this._prefs.state.useCustomBrightness&&(i.brightness=this._prefs.state.brightness);try{await this.hass.callService("aqara_advanced_lighting","set_segment_pattern",i),await this._loadRunningOperations()}catch(e){}}async _activateUserCCTSequencePreset(e){if(!this._prefs.state.selectedEntities.length)return;if("solar"===e.mode||"schedule"===e.mode)return await this.hass.callService("aqara_advanced_lighting","start_cct_sequence",{entity_id:this._prefs.state.selectedEntities,preset:e.name,sync:!0}),void await this._loadRunningOperations();const t={entity_id:this._prefs.state.selectedEntities,preset:e.name,loop_mode:e.loop_mode,end_behavior:e.end_behavior,turn_on:!0,sync:!0};"count"===e.loop_mode&&void 0!==e.loop_count&&(t.loop_count=e.loop_count),e.steps.forEach((e,i)=>{const s=i+1;s<=20&&(t[`step_${s}_color_temp`]=e.color_temp,t[`step_${s}_brightness`]=e.brightness,t[`step_${s}_transition`]=e.transition,t[`step_${s}_hold`]=e.hold)}),await this.hass.callService("aqara_advanced_lighting","start_cct_sequence",t),await this._loadRunningOperations()}async _activateUserSegmentSequencePreset(e){if(!this._prefs.state.selectedEntities.length)return;const t={entity_id:this._prefs.state.selectedEntities,preset:e.name,loop_mode:e.loop_mode,end_behavior:e.end_behavior,turn_on:!0,sync:!0};this._prefs.state.useCustomBrightness&&(t.brightness=this._prefs.state.brightness),"count"===e.loop_mode&&void 0!==e.loop_count&&(t.loop_count=e.loop_count),e.steps.forEach((e,i)=>{const s=i+1;s<=20&&(t[`step_${s}_segments`]=e.segments,t[`step_${s}_mode`]=e.mode,t[`step_${s}_duration`]=e.duration,t[`step_${s}_hold`]=e.hold,t[`step_${s}_activation_pattern`]=e.activation_pattern,e.colors&&Array.isArray(e.colors)&&e.colors.forEach((e,i)=>{i<6&&(t[`step_${s}_color_${i+1}`]=e)}))}),await this.hass.callService("aqara_advanced_lighting","start_segment_sequence",t),await this._loadRunningOperations()}async _activateUserDynamicScenePreset(e){if(!this._prefs.state.selectedEntities.length)return;const t=this._prefs.state.useCustomBrightness?this._prefs.state.brightness:null,i={entity_id:this._prefs.state.selectedEntities,scene_name:e.name,transition_time:e.transition_time,hold_time:e.hold_time,distribution_mode:this._prefs.state.useDistributionModeOverride?this._prefs.state.distributionModeOverride:e.distribution_mode,random_order:e.random_order,loop_mode:e.loop_mode,end_behavior:e.end_behavior};void 0!==e.offset_delay&&e.offset_delay>0&&(i.offset_delay=e.offset_delay),"count"===e.loop_mode&&void 0!==e.loop_count&&(i.loop_count=e.loop_count),i.colors=e.colors.map(e=>({x:e.x,y:e.y,brightness_pct:t??e.brightness_pct})),this._prefs.state.useStaticSceneMode&&(i.static=!0),this._applyAudioOverrides(i),this._applyPresetAudioFields(i,e),await this.hass.callService("aqara_advanced_lighting","start_dynamic_scene",i),await this._loadRunningOperations()}render(){if(this._loading)return N`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize("title")}</div>
          </div>
        </div>
        <div class="content">
          <div class="loading">${this._localize("errors.loading_presets")}</div>
        </div>
      `;if(this._error)return N`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize("title")}</div>
          </div>
        </div>
        <div class="content">
          <ha-alert alert-type="error" title="${this._localize("errors.title")}">
            ${this._error}
          </ha-alert>
        </div>
      `;if(!this._presets)return N`
        <div class="header">
          <div class="toolbar">
            <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
            <div class="main-title">${this._localize("title")}</div>
          </div>
        </div>
        <div class="content">
          <ha-alert alert-type="warning" title="${this._localize("errors.no_presets_title")}">
            ${this._localize("errors.no_presets_message")}
          </ha-alert>
        </div>
      `;const e=this._backendVersion&&this._backendVersion!==this._frontendVersion;return N`
      <div class="header">
        <div class="toolbar">
          <ha-menu-button .hass=${this.hass} .narrow=${this.narrow}></ha-menu-button>
          <div class="main-title">${this._localize("title")}</div>
          ${this._backendVersion?N`
            <div
              class="version-display ${e?"version-mismatch":""}"
              title="${e?this._localize("tooltips.version_mismatch",{backend:this._backendVersion,frontend:this._frontendVersion}):`v${this._backendVersion}`}"
            >
              ${this._setupComplete?"":N`
                <span class="setup-badge" title="${this._localize("tooltips.setup_in_progress")}">${this._localize("status.setting_up")}</span>
              `}
              ${e?N`
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span class="version-text">v${this._backendVersion} / v${this._frontendVersion}</span>
              `:N`
                <span class="version-text">v${this._backendVersion}</span>
              `}
            </div>
          `:""}
        </div>
        <ha-tab-group @wa-tab-show=${this._handleTabChange}>
          <ha-tab-group-tab slot="nav" panel="activate" .active=${"activate"===this._activeTab}>
            ${this._localize("tabs.activate")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="scenes" .active=${"scenes"===this._activeTab}>
            ${this._localize("tabs.scenes")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="effects" .active=${"effects"===this._activeTab}>
            ${this._localize("tabs.effects")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="patterns" .active=${"patterns"===this._activeTab}>
            ${this._localize("tabs.patterns")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="cct" .active=${"cct"===this._activeTab}>
            ${this._localize("tabs.cct")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="segments" .active=${"segments"===this._activeTab}>
            ${this._localize("tabs.segments")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="config" .active=${"config"===this._activeTab}>
            ${this._localize("tabs.config")}
          </ha-tab-group-tab>
          <ha-tab-group-tab slot="nav" panel="presets" .active=${"presets"===this._activeTab}>
            ${this._localize("tabs.presets")}
          </ha-tab-group-tab>
        </ha-tab-group>
      </div>
      <div class="content">
        <div class="tab-content">
          ${this._renderTabContent()}
        </div>
      </div>
    `}_renderTabContent(){switch(this._activeTab){case"activate":default:return this._renderActivateTab();case"effects":return this._renderEffectsTab();case"patterns":return this._renderPatternsTab();case"cct":return this._renderCCTTab();case"segments":return this._renderSegmentsTab();case"scenes":return this._renderScenesTab();case"presets":return this._renderPresetsTab();case"config":return N`
          <aqara-config-tab
            .hass=${this.hass}
            .selectedEntities=${this._prefs.state.selectedEntities}
            .supportedEntities=${this._supportedEntities}
            .translations=${this._translations}
            .collapsed=${this._prefs.state.collapsed}
            .includeAllLights=${this._prefs.state.includeAllLights}
            .z2mInstances=${this._z2mInstances}
            .softwareTransitionEntities=${this._prefs.state.softwareTransitionEntities}
            .entityAudioConfig=${this._prefs.state.entityAudioConfig}
            .audioOverrideEntity=${this._prefs.state.audioOverrideEntity}
            @collapsed-changed=${e=>this._prefs.setCollapsed(e.detail.sectionId,e.detail.collapsed,this.hass)}
            @audio-override-entity-changed=${e=>this._handleAudioOverrideEntityChange(e)}
            @global-preferences-changed=${e=>this._applyGlobalPreferencesFromConfigTab(e.detail)}
            @toast=${e=>this._showToast(e.detail.message)}
          ></aqara-config-tab>
        `}}_renderActivateTab(){const e=this._filterPresets(),t=this._prefs.state.selectedEntities.length>0,i="target_controls",s=!this._prefs.state.collapsed[i];return N`
      <ha-expansion-panel
        outlined
        .expanded=${s}
        @expanded-changed=${e=>this._handleExpansionChange(i,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("target.section_title")}</div>
            <div class="section-subtitle">${t?this._localize(1===this._prefs.state.selectedEntities.length?"target.lights_selected":"target.lights_selected_plural",{count:this._prefs.state.selectedEntities.length.toString()}):this._localize("target.select_lights")}</div>
          </div>
        </div>
        <div class="section-content controls-content">
          <div class="target-favorites-grid">
            <div class="control-row">
              <div class="control-input target-input ${t?"has-selection":""}">
                <div class="target-selector">
                  <ha-selector
                    .hass=${this.hass}
                    .selector=${{entity:{multiple:!0,domain:"light",...!this._prefs.state.includeAllLights&&this._supportedEntities.size>0?{include_entities:Array.from(this._supportedEntities.keys())}:{}}}}
                    .value=${this._prefs.state.selectedEntities}
                    @value-changed=${this._handleEntityChanged}
                  ></ha-selector>
                </div>
                <div class="include-all-lights-toggle">
                  <label class="toggle-label">
                    <ha-switch
                      .checked=${this._prefs.state.includeAllLights}
                      @change=${this._handleIncludeAllLightsToggle}
                      title="${this._localize("target.include_all_lights_hint")}"
                    ></ha-switch>
                    <span>${this._localize("target.include_all_lights_label")}</span>
                  </label>
                </div>
              </div>
              ${t?N`
                    <button class="save-favorite-bar" @click=${this._addFavorite}>
                      <ha-icon icon="mdi:star-plus-outline"></ha-icon>
                      <span>${this._localize("target.save_as_favorite")}</span>
                    </button>
                  `:""}
            </div>

            ${this._favorites.length>0?N`
                  <div class="control-row">
                    <span class="control-label">${this._localize("target.favorites_label")}</span>
                    <div class="control-input favorites-container">
                      ${this._favorites.map(e=>{const t=e.entities[0]||"",i=this._getEntityIcon(t),s=e.entities.length,o=this._getEntityState(t),a=this._getEntityColor(t),n="on"===o,r="unavailable"===o||"unknown"===o,l=this._prefs.state.activeFavoriteId===e.id;let c="",d="";if(a){const e=a.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);if(e){const[,t,i,s]=e;c=`background: rgba(${t}, ${i}, ${s}, 0.2);`,d=`color: ${a};`}}const h=this._renamingFavoriteId===e.id,p=this._favoriteEditModeId===e.id;return N`
                          <div
                            class="favorite-button ${n?"state-on":"state-off"} ${r?"state-unavailable":""} ${l?"selected":""} ${h?"renaming":""} ${p?"edit-mode":""}"
                            @click=${()=>{p?this._clearFavoriteEditMode():h||this._selectFavorite(e)}}
                            @touchstart=${()=>this._handleFavoriteTouchStart(e)}
                            @touchend=${e=>this._handleFavoriteTouchEnd(e)}
                            @touchmove=${this._handleFavoriteTouchMove}
                          >
                            <div class="favorite-button-icon" style="${c}">
                              <ha-icon icon="${i}" style="${d}"></ha-icon>
                            </div>
                            <div class="favorite-button-content">
                              ${h?N`
                                    <input
                                      class="favorite-rename-input"
                                      type="text"
                                      .value=${this._renamingFavoriteName}
                                      @input=${this._handleRenameInput}
                                      @keydown=${this._handleRenameKeydown}
                                      @blur=${this._handleRenameBlur}
                                      @click=${e=>e.stopPropagation()}
                                    />
                                  `:N`<div class="favorite-button-name">${e.name}</div>`}
                              ${s>1&&!h?N`<div class="favorite-button-count">${this._localize("target.favorite_lights_count",{count:s.toString()})}</div>`:""}
                            </div>
                            <div class="favorite-button-actions favorite-button-actions-left">
                              <ha-icon-button
                                class="favorite-button-action"
                                @click=${t=>this._startRenameFavorite(t,e)}
                                title="${this._localize("tooltips.favorite_rename")}"
                              >
                                <ha-icon icon="mdi:pencil"></ha-icon>
                              </ha-icon-button>
                            </div>
                            <div class="favorite-button-actions">
                              <ha-icon-button
                                class="favorite-button-action"
                                @click=${t=>{t.stopPropagation(),this._removeFavorite(e.id)}}
                                title="${this._localize("tooltips.favorite_remove")}"
                              >
                                <ha-icon icon="mdi:close"></ha-icon>
                              </ha-icon-button>
                            </div>
                          </div>
                        `})}
                    </div>
                  </div>
                `:N`
                  <div class="control-row">
                    <div class="favorites-empty-state">
                      <ha-icon icon="mdi:star-outline"></ha-icon>
                      <span>${this._localize("target.favorites_empty")}</span>
                    </div>
                  </div>
                `}
          </div>

          ${t?N`
                <div class="control-row">
                  <span class="control-label">${this._localize("target.light_control_label")}</span>
                  <div class="control-input light-tile-container" ${Ee(this._tileCardRef)}>
                  </div>
                </div>
              `:""}
        </div>
      </ha-expansion-panel>

      ${t||this._runningOperations.length>0?N`
            <ha-expansion-panel
              outlined
              .expanded=${!this._prefs.state.collapsed.controls}
              @expanded-changed=${e=>this._handleExpansionChange("controls",e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("target.controls_card_title")}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <aqara-running-operations
                  .hass=${this.hass}
                  .operations=${this._runningOperations}
                  .presetLookup=${this._presetLookup}
                  .translations=${this._translations}
                  @operations-changed=${()=>this._loadRunningOperations()}
                ></aqara-running-operations>
              </div>
            </ha-expansion-panel>
          `:""}

      ${t?N`
            <ha-expansion-panel
              outlined
              .expanded=${void 0!==this._prefs.state.collapsed.activation_overrides&&!this._prefs.state.collapsed.activation_overrides}
              @expanded-changed=${e=>this._handleExpansionChange("activation_overrides",e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("target.activation_overrides_title")}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <!-- All toggles at the top -->
                <div class="overrides-grid">
                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive?"0.5":"1"}">
                    <span class="form-label">${this._localize("target.custom_brightness_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useCustomBrightness}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleCustomBrightnessToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive?"0.5":"1"}">
                    <span class="form-label">${this._localize("target.static_scene_mode_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useStaticSceneMode}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleStaticSceneModeToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item" style="opacity: ${this._prefs.state.useAudioReactive?"0.5":"1"}">
                    <span class="form-label">${this._localize("target.distribution_mode_override_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useDistributionModeOverride}
                      .disabled=${this._prefs.state.useAudioReactive}
                      @change=${this._handleDistributionModeOverrideToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize("target.audio_reactive_label")||"Audio reactive"}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useAudioReactive}
                      @change=${this._handleAudioReactiveToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize("target.effect_audio_reactive_label")||"Effect audio reactive"}</span>
                    <ha-switch
                      .checked=${this._prefs.state.useEffectAudioReactive}
                      @change=${this._handleEffectAudioReactiveToggle}
                    ></ha-switch>
                  </div>
                </div>

                <!-- Parameters below all toggles -->
                ${this._prefs.state.useCustomBrightness?N`
                      <div class="brightness-slider" style="padding-top: 8px;">
                        <span class="form-label">${this._localize("target.brightness_override_label")||"Brightness"}</span>
                        <ha-selector
                          .hass=${this.hass}
                          .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                          .value=${this._prefs.state.brightness}
                          @value-changed=${this._handleBrightnessChange}
                        ></ha-selector>
                      </div>
                    `:""}

                ${this._prefs.state.useDistributionModeOverride?N`
                      <div class="brightness-slider" style="padding-top: 8px;">
                        <span class="form-label">${this._localize("target.distribution_mode_override_label")||"Color assignment"}</span>
                        <ha-selector
                          .hass=${this.hass}
                          .selector=${{select:{options:this._distributionModeOverrideOptions,mode:"dropdown"}}}
                          .value=${this._prefs.state.distributionModeOverride}
                          @value-changed=${this._handleDistributionModeOverrideChange}
                        ></ha-selector>
                      </div>
                    `:""}

                ${this._prefs.state.useAudioReactive?N`
                      <!-- Row 1: Audio preset + Entity selector -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_preset_label")||"Audio preset"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:this._audioPresetOptions,mode:"dropdown"}}}
                            .value=${this._currentAudioOverridePreset}
                            @value-changed=${this._handleAudioOverridePresetChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize("target.audio_entity_label")||"Audio sensor entity"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{entity:{domain:"binary_sensor"}}}
                            .value=${this._prefs.state.audioOverrideEntity}
                            @value-changed=${this._handleAudioOverrideEntityChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 2: Detection mode + Color advance -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_detection_mode_label")||"Detection mode"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:[{value:"spectral_flux",label:this._localize("dynamic_scene.audio_detection_spectral_flux")||"Spectral flux (all genres)"},{value:"bass_energy",label:this._localize("dynamic_scene.audio_detection_bass_energy")||"Bass energy (rhythmic music)"},{value:"complex_domain",label:this._localize("dynamic_scene.audio_detection_complex_domain")||"Complex domain (phase+magnitude)"}],mode:"dropdown"}}}
                            .value=${this._prefs.state.audioOverrideDetectionMode}
                            @value-changed=${this._handleAudioOverrideDetectionModeChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_color_advance_label")||"Color advance"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:si(this._audioModeRegistry,ii(this.hass,this._prefs.state.audioOverrideEntity),e=>this._localize(e)),mode:"dropdown"}}}
                            .value=${this._prefs.state.audioOverrideColorAdvance}
                            @value-changed=${this._handleAudioOverrideColorAdvanceChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 3: Sensitivity + Transition speed -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_sensitivity_label")||"Sensitivity"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.audioOverrideSensitivity}
                            @value-changed=${this._handleAudioOverrideSensitivityChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_transition_speed_label")||"Transition speed"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${!("on_onset"===this._prefs.state.audioOverrideColorAdvance||"beat_predictive"===this._prefs.state.audioOverrideColorAdvance||"onset_flash"===this._prefs.state.audioOverrideColorAdvance)}
                            .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.audioOverrideTransitionSpeed}
                            @value-changed=${this._handleAudioOverrideTransitionSpeedChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Row 4: Prediction aggressiveness + Latency compensation -->
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_prediction_aggressiveness_label")||"Prediction aggressiveness"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${"beat_predictive"!==this._prefs.state.audioOverrideColorAdvance}
                            .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.audioOverridePredictionAggressiveness}
                            @value-changed=${this._handleAudioOverridePredictionAggressivenessChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize("dynamic_scene.audio_latency_compensation_label")||"Latency compensation"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${"beat_predictive"!==this._prefs.state.audioOverrideColorAdvance}
                            .selector=${{number:{min:0,max:500,mode:"slider",unit_of_measurement:"ms"}}}
                            .value=${this._prefs.state.audioOverrideLatencyCompensationMs}
                            @value-changed=${this._handleAudioOverrideLatencyCompensationChange}
                          ></ha-selector>
                        </div>
                      </div>
                      <!-- Dropdowns: brightness curve and silence behavior -->
                      <div class="audio-dropdowns-grid">
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_brightness_curve_label")||"Brightness curve"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .disabled=${!("on_onset"===this._prefs.state.audioOverrideColorAdvance||"continuous"===this._prefs.state.audioOverrideColorAdvance||"beat_predictive"===this._prefs.state.audioOverrideColorAdvance)}
                            .selector=${{select:{options:[{value:"disabled",label:this._localize("dynamic_scene.audio_brightness_curve_disabled")||"Disabled"},{value:"linear",label:this._localize("dynamic_scene.audio_brightness_curve_linear")||"Linear"},{value:"logarithmic",label:this._localize("dynamic_scene.audio_brightness_curve_logarithmic")||"Logarithmic"},{value:"exponential",label:this._localize("dynamic_scene.audio_brightness_curve_exponential")||"Exponential"}],mode:"dropdown"}}}
                            .value=${this._prefs.state.audioOverrideBrightnessCurve??"disabled"}
                            @value-changed=${e=>{const t=e.detail.value;this._prefs.update({audioOverrideBrightnessCurve:"disabled"===t?null:t||"linear"},this.hass)}}
                          ></ha-selector>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_silence_behavior_label")||"Silence behavior"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:[{value:"hold",label:this._localize("dynamic_scene.audio_silence_hold")||"Hold last color"},{value:"slow_cycle",label:this._localize("dynamic_scene.audio_silence_slow_cycle")||"Slow cycle"},{value:"decay_min",label:this._localize("dynamic_scene.audio_silence_decay_min")||"Decay to min"},{value:"decay_mid",label:this._localize("dynamic_scene.audio_silence_decay_mid")||"Decay to mid"}],mode:"dropdown"}}}
                            .value=${this._prefs.state.audioOverrideSilenceBehavior}
                            @value-changed=${e=>{this._prefs.update({audioOverrideSilenceBehavior:e.detail.value||"slow_cycle"},this.hass)}}
                          ></ha-selector>
                        </div>
                      </div>

                      ${this._prefs.state.audioOverrideBrightnessCurve?N`
                      <div class="audio-sliders-row">
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_brightness_min_label")||"Brightness min"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{number:{min:0,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.audioOverrideBrightnessMin}
                            @value-changed=${e=>{this._prefs.update({audioOverrideBrightnessMin:e.detail.value??30},this.hass)}}
                          ></ha-selector>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_brightness_max_label")||"Brightness max"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{number:{min:0,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.audioOverrideBrightnessMax}
                            @value-changed=${e=>{this._prefs.update({audioOverrideBrightnessMax:e.detail.value??100},this.hass)}}
                          ></ha-selector>
                        </div>
                      </div>
                      `:""}

                      <!-- Toggles: 4-per-row desktop, 2-per-row mobile -->
                      <div class="audio-toggles-grid">
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_frequency_zone_label")||"Frequency zone"}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideFrequencyZone}
                            @change=${e=>{this._prefs.update({audioOverrideFrequencyZone:e.target.checked},this.hass)}}
                          ></ha-switch>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_color_by_frequency_label")||"Color by frequency"}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideColorByFrequency}
                            @change=${e=>{this._prefs.update({audioOverrideColorByFrequency:e.target.checked},this.hass)}}
                          ></ha-switch>
                        </div>
                        <div class="override-item">
                          <span class="form-label">${this._localize("dynamic_scene.audio_rolloff_brightness_label")||"Rolloff brightness"}</span>
                          <ha-switch
                            .checked=${this._prefs.state.audioOverrideRolloffBrightness}
                            @change=${e=>{this._prefs.update({audioOverrideRolloffBrightness:e.target.checked},this.hass)}}
                          ></ha-switch>
                        </div>
                      </div>
                    `:""}

                ${this._prefs.state.useEffectAudioReactive?N`
                      <div class="audio-override-row" style="padding-top: 8px;">
                        <div>
                          <span class="form-label">${this._localize("target.audio_entity_label")||"Audio sensor entity"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{entity:{domain:"binary_sensor"}}}
                            .value=${this._prefs.state.audioOverrideEntity}
                            @value-changed=${this._handleAudioOverrideEntityChange}
                          ></ha-selector>
                        </div>
                        <div>
                          <span class="form-label">${this._localize("target.effect_sensitivity_label")||"Sensitivity"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{number:{min:1,max:100,mode:"slider",unit_of_measurement:"%"}}}
                            .value=${this._prefs.state.effectAudioOverrideSensitivity}
                            @value-changed=${e=>{this._prefs.update({effectAudioOverrideSensitivity:e.detail.value??50},this.hass)}}
                          ></ha-selector>
                        </div>
                      </div>
                      <div class="audio-override-row">
                        <div>
                          <span class="form-label">${this._localize("target.effect_silence_behavior_label")||"Silence behavior"}</span>
                          <ha-selector
                            .hass=${this.hass}
                            .selector=${{select:{options:[{value:"hold",label:this._localize("effect_editor.silence_hold")||"Hold last values"},{value:"decay_min",label:this._localize("effect_editor.silence_decay_min")||"Decay to minimum"},{value:"decay_mid",label:this._localize("effect_editor.silence_decay_mid")||"Decay to midpoint"}],mode:"dropdown"}}}
                            .value=${this._prefs.state.effectAudioOverrideSilenceBehavior}
                            @value-changed=${e=>{this._prefs.update({effectAudioOverrideSilenceBehavior:e.detail.value||"decay_min"},this.hass)}}
                          ></ha-selector>
                        </div>
                      </div>
                    `:""}
              </div>
            </ha-expansion-panel>

            <ha-expansion-panel
              outlined
              .expanded=${void 0!==this._prefs.state.collapsed.override_detection&&!this._prefs.state.collapsed.override_detection}
              @expanded-changed=${e=>this._handleExpansionChange("override_detection",e)}
            >
              <div slot="header" class="section-header">
                <div>
                  <div class="section-title">${this._localize("target.override_detection_title")}</div>
                </div>
              </div>
              <div class="section-content controls-content">
                <div class="overrides-grid">
                  <div class="override-item">
                    <span class="form-label">${this._localize("target.ignore_external_changes_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleIgnoreExternalChangesToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize("target.override_control_mode_label")}</span>
                    <ha-selector
                      .hass=${this.hass}
                      .selector=${{select:{options:[{value:"pause_all",label:this._localize("target.override_mode_pause_all")},{value:"pause_changed",label:this._localize("target.override_mode_pause_changed")}],mode:"dropdown"}}}
                      .value=${this._prefs.state.overrideControlMode}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @value-changed=${this._handleOverrideControlModeChanged}
                    ></ha-selector>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize("target.bare_turn_on_only_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.bareTurnOnOnly}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleBareTurnOnOnlyToggle}
                    ></ha-switch>
                  </div>

                  <div class="override-item">
                    <span class="form-label">${this._localize("target.detect_non_ha_changes_label")}</span>
                    <ha-switch
                      .checked=${this._prefs.state.detectNonHaChanges}
                      .disabled=${this._prefs.state.ignoreExternalChanges}
                      @change=${this._handleDetectNonHaChangesToggle}
                    ></ha-switch>
                  </div>
                </div>
              </div>
            </ha-expansion-panel>
          `:""}

      ${t?"":N`<div class="no-lights">${this._localize("target.no_lights_message")}</div>`}

      ${this._hasIncompatibleLights?N`
            <ha-alert alert-type="error" title="${this._localize("errors.incompatible_light_title")}">
              ${this._localize("errors.incompatible_light_message")}
            </ha-alert>
          `:""}

      ${t&&!this._hasIncompatibleLights?this._renderFavoritesSection():""}

      ${e.showDynamicScenes&&((this._presets?.dynamic_scenes?.length??0)>0||this._getFilteredUserDynamicScenePresets().length>0)&&!this._hasIncompatibleLights?this._renderDynamicScenesSection():""}

      ${e.showDynamicEffects&&!this._hasIncompatibleLights?N`
            ${e.hasT2&&(e.t2Presets.length>0||this._getUserEffectPresetsForDeviceType("t2_bulb").length>0)?this._renderDynamicEffectsSection(this._localize("devices.t2_bulb"),e.t2Presets,"t2_bulb"):""}
            ${e.hasT1M&&(e.t1mPresets.length>0||this._getUserEffectPresetsForDeviceType("t1m").length>0)?this._renderDynamicEffectsSection(this._localize("devices.t1m"),e.t1mPresets,"t1m"):""}
            ${e.hasT1Strip&&(e.t1StripPresets.length>0||this._getUserEffectPresetsForDeviceType("t1_strip").length>0)?this._renderDynamicEffectsSection(this._localize("devices.t1_strip"),e.t1StripPresets,"t1_strip"):""}
          `:""}

      ${e.showMusicSync&&!this._hasIncompatibleLights?this._renderMusicSyncSection():""}

      ${e.showSegmentPatterns&&!this._hasIncompatibleLights?N`
            ${e.hasT1M&&((this._presets?.segment_patterns?.length??0)>0||this._getUserPatternPresetsForDeviceType("t1m").length>0)?this._renderSegmentPatternsSection(this._localize("devices.t1m"),this._presets?.segment_patterns||[],"t1m"):""}
            ${e.hasT1Strip&&((this._presets?.segment_patterns?.length??0)>0||this._getUserPatternPresetsForDeviceType("t1_strip").length>0)?this._renderSegmentPatternsSection(this._localize("devices.t1_strip"),this._presets?.segment_patterns||[],"t1_strip"):""}
          `:""}

      ${e.showCCTSequences&&((this._presets?.cct_sequences?.length??0)>0||this._getFilteredUserCCTSequencePresets().length>0)&&!this._hasIncompatibleLights?this._renderCCTSequencesSection():""}

      ${e.showSegmentSequences&&!this._hasIncompatibleLights?N`
            ${e.hasT1M&&((this._presets?.segment_sequences?.length??0)>0||this._getUserSegmentSequencePresetsForDeviceType("t1m").length>0)?this._renderSegmentSequencesSection(this._localize("devices.t1m"),this._presets?.segment_sequences||[],"t1m"):""}
            ${e.hasT1Strip&&((this._presets?.segment_sequences?.length??0)>0||this._getUserSegmentSequencePresetsForDeviceType("t1_strip").length>0)?this._renderSegmentSequencesSection(this._localize("devices.t1_strip"),this._presets?.segment_sequences||[],"t1_strip"):""}
          `:""}
    `}_renderEffectsTab(){const e="effect"===this._editingPreset?.type?this._editingPreset.preset:void 0,t=this._isEffectsCompatible(),i=this._prefs.state.selectedEntities.length>0;return N`
      <ha-card class="editor-form">
        <h2>${e?this._localize("dialogs.edit_effect_title"):this._localize("dialogs.create_effect_title")}</h2>
        <p class="editor-description">
          ${e?this._localize("dialogs.edit_effect_description"):this._localize("dialogs.create_effect_description")}
        </p>
        ${i&&!t?N`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize("dialogs.compatibility_warning_effects")}
          </ha-alert>
        `:""}
        <effect-editor
          .hass=${this.hass}
          .preset=${e}
          .draft=${this._getEditorDraft("effects")}
          .translations=${this._translations}
          .editMode=${!!e&&!this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${i}
          .isCompatible=${t}
          .previewActive=${this._effectPreviewActive}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor("effect")}
          .colorHistory=${this._prefs.state.colorHistory}
          .defaultAudioEntity=${this._prefs.state.audioOverrideEntity}
          @save=${this._handleEffectSave}
          @preview=${this._handleEffectPreview}
          @stop-preview=${this._handleEffectStopPreview}
          @cancel=${this._handleEditorCancel}
        ></effect-editor>
      </ha-card>
    `}async _handleEffectSave(e){if("effect"!==this._editingPreset?.type||this._editingPreset.isDuplicate)await this._saveUserPreset("effect",e.detail);else{const t=this._editingPreset.preset;await this._updateUserPreset("effect",t.id,e.detail)}this._clearEditorDraft("effects"),this._editingPreset=void 0,this._setActiveTab("presets")}async _handleEditorCancel(){await this._stopActivePreview(),this._clearEditorDraft(this._activeTab),this._resetCurrentEditor(),this._editingPreset=void 0,this._setActiveTab("activate")}async _stopActivePreview(){switch(this._activeTab){case"effects":this._effectPreviewActive&&await this._handleEffectStopPreview();break;case"patterns":this._patternPreviewActive&&await this._handlePatternStopPreview();break;case"cct":this._cctPreviewActive&&await this._handleCCTStopPreview();break;case"segments":this._segmentSequencePreviewActive&&await this._handleSegmentSequenceStopPreview();break;case"scenes":this._scenePreviewActive&&await this._handleSceneStopPreview()}}_resetCurrentEditor(){const e={effects:"effect-editor",patterns:"pattern-editor",cct:"cct-sequence-editor",segments:"segment-sequence-editor",scenes:"dynamic-scene-editor"}[this._activeTab];if(!e)return;const t=this.shadowRoot?.querySelector(e);t&&"function"==typeof t.resetToDefaults&&t.resetToDefaults()}async _handleEffectPreview(e){const t=this._getEffectsCompatibleEntities();if(!t.length)return;const i=e.detail,s={entity_id:t,effect:i.effect,speed:i.effect_speed,turn_on:!0,sync:!0};i.effect_colors&&i.effect_colors.forEach((e,t)=>{if(t<8)if("x"in e&&"y"in e&&void 0!==e.x&&void 0!==e.y){const i=Ue(e.x,e.y,255);s[`color_${t+1}`]=[i.r,i.g,i.b]}else"r"in e&&"g"in e&&"b"in e&&(s[`color_${t+1}`]=[e.r,e.g,e.b])}),void 0!==i.effect_brightness&&(s.brightness=i.effect_brightness),i.effect_segments&&(s.segments=i.effect_segments),i.audio_config?.audio_entity&&i.audio_config?.audio_speed_mode&&(s.audio_entity=i.audio_config.audio_entity,s.audio_sensitivity=i.audio_config.audio_sensitivity,s.audio_silence_behavior=i.audio_config.audio_silence_behavior,s.audio_speed_mode=i.audio_config.audio_speed_mode,void 0!==i.audio_config.audio_speed_min&&(s.audio_speed_min=i.audio_config.audio_speed_min),void 0!==i.audio_config.audio_speed_max&&(s.audio_speed_max=i.audio_config.audio_speed_max)),await this.hass.callService("aqara_advanced_lighting","set_dynamic_effect",s),this._effectPreviewActive=!0}async _handleEffectStopPreview(){const e=this._getEffectsCompatibleEntities();e.length&&(await this.hass.callService("aqara_advanced_lighting","stop_effect",{entity_id:e,restore_state:!0}),this._effectPreviewActive=!1)}_renderPatternsTab(){const e="pattern"===this._editingPreset?.type?this._editingPreset.preset:void 0,t=this._isPatternsCompatible(),i=this._prefs.state.selectedEntities.length>0;return N`
      <ha-card class="editor-form">
        <h2>${e?this._localize("dialogs.edit_pattern_title"):this._localize("dialogs.create_pattern_title")}</h2>
        <p class="editor-description">
          ${e?this._localize("dialogs.edit_pattern_description"):this._localize("dialogs.create_pattern_description")}
        </p>
        ${i&&!t?N`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize("dialogs.compatibility_warning_patterns")}
          </ha-alert>
        `:""}
        <pattern-editor
          .hass=${this.hass}
          .preset=${e}
          .draft=${this._getEditorDraft("patterns")}
          .translations=${this._translations}
          .editMode=${!!e&&!this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${i}
          .isCompatible=${t}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor("pattern")}
          .colorHistory=${this._prefs.state.colorHistory}
          .previewActive=${this._patternPreviewActive}
          @save=${this._handlePatternSave}
          @preview=${this._handlePatternPreview}
          @stop-preview=${this._handlePatternStopPreview}
          @cancel=${this._handleEditorCancel}
        ></pattern-editor>
      </ha-card>
    `}async _handlePatternSave(e){if("pattern"!==this._editingPreset?.type||this._editingPreset.isDuplicate)await this._saveUserPreset("segment_pattern",e.detail);else{const t=this._editingPreset.preset;await this._updateUserPreset("segment_pattern",t.id,e.detail)}this._clearEditorDraft("patterns"),this._editingPreset=void 0,this._setActiveTab("presets")}async _handlePatternPreview(e){const t=this._getPatternsCompatibleEntities();if(!t.length)return;const i=e.detail;if(!i.segments||!Array.isArray(i.segments))return;const s=i.segments.map(e=>({segment:e.segment,color:{r:e.color.r,g:e.color.g,b:e.color.b}}));try{await this.hass.callService("aqara_advanced_lighting","set_segment_pattern",{entity_id:t,segment_colors:s,turn_on:!0,turn_off_unspecified:i.turn_off_unspecified??!0,sync:!0}),this._patternPreviewActive=!0}catch(e){}}async _handlePatternStopPreview(){const e=this._getPatternsCompatibleEntities();e.length&&(await this.hass.callService("aqara_advanced_lighting","stop_effect",{entity_id:e,restore_state:!0}),this._patternPreviewActive=!1)}_renderCCTTab(){const e="cct"===this._editingPreset?.type?this._editingPreset.preset:void 0,t=this._isCCTCompatible(),i=this._prefs.state.selectedEntities.length>0;return N`
      <ha-card class="editor-form">
        <h2>${e?this._localize("dialogs.edit_cct_title"):this._localize("dialogs.create_cct_title")}</h2>
        <p class="editor-description">
          ${e?this._localize("dialogs.edit_cct_description"):this._localize("dialogs.create_cct_description")}
        </p>
        ${i&&!t?N`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize("dialogs.compatibility_warning_cct")}
          </ha-alert>
        `:""}
        <cct-sequence-editor
          .hass=${this.hass}
          .preset=${e}
          .draft=${this._getEditorDraft("cct")}
          .translations=${this._translations}
          .editMode=${!!e&&!this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${i}
          .isCompatible=${t}
          .selectedEntities=${this._prefs.state.selectedEntities}
          .previewActive=${this._cctPreviewActive}
          .deviceContext=${this._getDeviceContextForEditor("cct")}
          @save=${this._handleCCTSave}
          @preview=${this._handleCCTPreview}
          @stop-preview=${this._handleCCTStopPreview}
          @cancel=${this._handleEditorCancel}
        ></cct-sequence-editor>
      </ha-card>
    `}async _handleCCTSave(e){if("cct"!==this._editingPreset?.type||this._editingPreset.isDuplicate)await this._saveUserPreset("cct_sequence",e.detail);else{const t=this._editingPreset.preset;await this._updateUserPreset("cct_sequence",t.id,e.detail)}this._clearEditorDraft("cct"),this._editingPreset=void 0,this._setActiveTab("presets")}async _handleCCTPreview(e){const t=this._getCCTCompatibleEntities();if(!t.length)return;const i=e.detail,s="schedule"===i.mode&&i.schedule_steps||"solar"===i.mode&&i.solar_steps,o={entity_id:t,loop_mode:i.loop_mode,end_behavior:i.end_behavior,skip_first_in_loop:i.skip_first_in_loop||!1,turn_on:!s,sync:!0};"count"===i.loop_mode&&void 0!==i.loop_count&&(o.loop_count=i.loop_count),"schedule"===i.mode&&i.schedule_steps?(o.mode="schedule",o.schedule_steps=i.schedule_steps):"solar"===i.mode&&i.solar_steps?(o.mode="solar",o.solar_steps=i.solar_steps):i.steps&&Array.isArray(i.steps)&&i.steps.forEach((e,t)=>{const i=t+1;i<=20&&(o[`step_${i}_color_temp`]=e.color_temp,o[`step_${i}_brightness`]=e.brightness,o[`step_${i}_transition`]=e.transition,o[`step_${i}_hold`]=e.hold)}),await this.hass.callService("aqara_advanced_lighting","start_cct_sequence",o),this._cctPreviewActive=!0}async _handleCCTStopPreview(){const e=this._getCCTCompatibleEntities();e.length&&(await this.hass.callService("aqara_advanced_lighting","stop_cct_sequence",{entity_id:e,restore_state:!0}),this._cctPreviewActive=!1)}_renderSegmentsTab(){const e="segment"===this._editingPreset?.type?this._editingPreset.preset:void 0,t=this._isSegmentsCompatible(),i=this._prefs.state.selectedEntities.length>0;return N`
      <ha-card class="editor-form">
        <h2>${e?this._localize("dialogs.edit_segment_title"):this._localize("dialogs.create_segment_title")}</h2>
        <p class="editor-description">
          ${e?this._localize("dialogs.edit_segment_description"):this._localize("dialogs.create_segment_description")}
        </p>
        ${i&&!t?N`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize("dialogs.compatibility_warning_segments")}
          </ha-alert>
        `:""}
        <segment-sequence-editor
          .hass=${this.hass}
          .preset=${e}
          .draft=${this._getEditorDraft("segments")}
          .translations=${this._translations}
          .editMode=${!!e&&!this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${i}
          .isCompatible=${t}
          .previewActive=${this._segmentSequencePreviewActive}
          .stripSegmentCount=${this._getT1StripSegmentCount()}
          .deviceContext=${this._getDeviceContextForEditor("segment")}
          .colorHistory=${this._prefs.state.colorHistory}
          @save=${this._handleSegmentSequenceSave}
          @preview=${this._handleSegmentSequencePreview}
          @stop-preview=${this._handleSegmentSequenceStopPreview}
          @cancel=${this._handleEditorCancel}
        ></segment-sequence-editor>
      </ha-card>
    `}async _handleSegmentSequenceSave(e){if("segment"!==this._editingPreset?.type||this._editingPreset.isDuplicate)await this._saveUserPreset("segment_sequence",e.detail);else{const t=this._editingPreset.preset;await this._updateUserPreset("segment_sequence",t.id,e.detail)}this._clearEditorDraft("segments"),this._editingPreset=void 0,this._setActiveTab("presets")}async _handleSegmentSequencePreview(e){const t=this._getSegmentsCompatibleEntities();if(!t.length)return;const i=e.detail,s={entity_id:t,loop_mode:i.loop_mode,end_behavior:i.end_behavior,clear_segments:i.clear_segments||!1,skip_first_in_loop:i.skip_first_in_loop||!1,turn_on:!0,sync:!0};"count"===i.loop_mode&&void 0!==i.loop_count&&(s.loop_count=i.loop_count),i.steps&&Array.isArray(i.steps)&&i.steps.forEach((e,t)=>{const i=t+1;i<=20&&(s[`step_${i}_segments`]=e.segments,s[`step_${i}_mode`]=e.mode,s[`step_${i}_duration`]=e.duration,s[`step_${i}_hold`]=e.hold,s[`step_${i}_activation_pattern`]=e.activation_pattern,e.segment_colors&&Array.isArray(e.segment_colors)&&e.segment_colors.length>0?s[`step_${i}_segment_colors`]=e.segment_colors:e.colors&&Array.isArray(e.colors)&&e.colors.forEach((e,t)=>{t<6&&(s[`step_${i}_color_${t+1}`]=e)}))}),await this.hass.callService("aqara_advanced_lighting","start_segment_sequence",s),this._segmentSequencePreviewActive=!0}async _handleSegmentSequenceStopPreview(){const e=this._getSegmentsCompatibleEntities();e.length&&(await this.hass.callService("aqara_advanced_lighting","stop_segment_sequence",{entity_id:e,restore_state:!0}),this._segmentSequencePreviewActive=!1)}_isScenesCompatible(){return!(!this.hass||!this._prefs.state.selectedEntities.length)&&this._prefs.state.selectedEntities.some(e=>{const t=this.hass.states[e];return!!t&&(this._hasRGBColorMode(t)||this._hasCCTColorMode(t))})}_hasCCTColorMode(e){return function(e){const t=e.attributes.supported_color_modes;return!!t&&Array.isArray(t)&&t.includes("color_temp")}(e)}_getScenesCompatibleEntities(){return this.hass?this._prefs.state.selectedEntities.filter(e=>{const t=this.hass.states[e];return!!t&&(this._hasRGBColorMode(t)||this._hasCCTColorMode(t))}):[]}_renderScenesTab(){const e="dynamic_scene"===this._editingPreset?.type?this._editingPreset.preset:void 0,t=this._isScenesCompatible(),i=this._prefs.state.selectedEntities.length>0;return N`
      <ha-card class="editor-form">
        <h2>${e?this._localize("dialogs.edit_scene_title"):this._localize("dialogs.create_scene_title")}</h2>
        <p class="editor-description">
          ${e?this._localize("dialogs.edit_scene_description"):this._localize("dialogs.create_scene_description")}
        </p>
        ${i&&!t?N`
          <ha-alert alert-type="warning" class="compatibility-warning">
            ${this._localize("dialogs.compatibility_warning_scenes")}
          </ha-alert>
        `:""}
        <dynamic-scene-editor
          .hass=${this.hass}
          .preset=${e}
          .draft=${this._getEditorDraft("scenes")}
          .translations=${this._translations}
          .editMode=${!!e&&!this._editingPreset?.isDuplicate}
          .hasSelectedEntities=${i}
          .isCompatible=${t}
          .selectedEntities=${this._prefs.state.selectedEntities}
          .previewActive=${this._scenePreviewActive}
          .colorHistory=${this._prefs.state.colorHistory}
          .defaultAudioEntity=${this._prefs.state.audioOverrideEntity}
          @save=${this._handleSceneSave}
          @preview=${this._handleScenePreview}
          @stop-preview=${this._handleSceneStopPreview}
          @cancel=${this._handleEditorCancel}
          @color-history-changed=${this._handleColorHistoryChanged}
        ></dynamic-scene-editor>
      </ha-card>
    `}async _handleSceneSave(e){if("dynamic_scene"!==this._editingPreset?.type||this._editingPreset.isDuplicate)await this._saveUserPreset("dynamic_scene",e.detail);else{const t=this._editingPreset.preset;await this._updateUserPreset("dynamic_scene",t.id,e.detail)}this._clearEditorDraft("scenes"),this._editingPreset=void 0,this._setActiveTab("presets")}async _handleScenePreview(e){const t=this._getScenesCompatibleEntities();if(!t.length)return;const i=e.detail,s={entity_id:t,transition_time:i.transition_time,hold_time:i.hold_time,distribution_mode:i.distribution_mode,random_order:i.random_order,loop_mode:i.loop_mode,end_behavior:i.end_behavior};void 0!==i.offset_delay&&i.offset_delay>0&&(s.offset_delay=i.offset_delay),"count"===i.loop_mode&&void 0!==i.loop_count&&(s.loop_count=i.loop_count),i.colors&&Array.isArray(i.colors)&&(s.colors=i.colors.map(e=>({x:e.x,y:e.y,brightness_pct:e.brightness_pct}))),i.audio_entity&&(s.audio_entity=i.audio_entity,i.audio_color_advance&&(s.audio_color_advance=i.audio_color_advance),null!=i.audio_sensitivity&&(s.audio_sensitivity=i.audio_sensitivity),void 0!==i.audio_brightness_curve&&(s.audio_brightness_curve=i.audio_brightness_curve),null!=i.audio_brightness_min&&(s.audio_brightness_min=i.audio_brightness_min),null!=i.audio_brightness_max&&(s.audio_brightness_max=i.audio_brightness_max),null!=i.audio_transition_speed&&(s.audio_transition_speed=i.audio_transition_speed),null!=i.audio_detection_mode&&(s.audio_detection_mode=i.audio_detection_mode),null!=i.audio_frequency_zone&&(s.audio_frequency_zone=i.audio_frequency_zone),null!=i.audio_silence_behavior&&(s.audio_silence_behavior=i.audio_silence_behavior),null!=i.audio_prediction_aggressiveness&&(s.audio_prediction_aggressiveness=i.audio_prediction_aggressiveness),null!=i.audio_latency_compensation_ms&&(s.audio_latency_compensation_ms=i.audio_latency_compensation_ms),null!=i.audio_color_by_frequency&&(s.audio_color_by_frequency=i.audio_color_by_frequency),null!=i.audio_rolloff_brightness&&(s.audio_rolloff_brightness=i.audio_rolloff_brightness)),await this.hass.callService("aqara_advanced_lighting","start_dynamic_scene",s),this._scenePreviewActive=!0}async _handleSceneStopPreview(){const e=this._getScenesCompatibleEntities();e.length&&(await this.hass.callService("aqara_advanced_lighting","stop_dynamic_scene",{entity_id:e,restore_state:!0}),this._scenePreviewActive=!1)}_enterSelectMode(){this._selectedPresetIds=new Set,this._isSelectMode=!0,this._presetEditModeId=null}_exitSelectMode(){this._isSelectMode=!1,this._selectedPresetIds=new Set}_togglePresetSelection(e){const t=new Set(this._selectedPresetIds);t.has(e)?t.delete(e):t.add(e),this._selectedPresetIds=t}_getAllPresetIds(){return this._userPresets?[...this._userPresets.effect_presets.map(e=>e.id),...this._userPresets.segment_pattern_presets.map(e=>e.id),...this._userPresets.cct_sequence_presets.map(e=>e.id),...this._userPresets.segment_sequence_presets.map(e=>e.id),...this._userPresets.dynamic_scene_presets.map(e=>e.id)]:[]}_isAllSelected(){const e=this._getAllPresetIds();return e.length>0&&e.every(e=>this._selectedPresetIds.has(e))}_toggleSelectAll(){this._isAllSelected()?this._selectedPresetIds=new Set:this._selectedPresetIds=new Set(this._getAllPresetIds())}async _handleExportSelected(){if(!this._userPresets||0===this._selectedPresetIds.size)return;const e=this._selectedPresetIds.size;try{await this._exportPresets([...this._selectedPresetIds]),this._exitSelectMode(),this._showToast(this._localize("presets.export_selected_success",{count:e.toString()}))}catch(e){this._showToast(this._localize("presets.export_error_network"))}}async _handleExportPresets(){this._isExporting=!0,this.requestUpdate();try{await this._exportPresets(),this._showToast(this._localize("presets.export_success"))}catch(e){this._showToast(this._localize("presets.export_error_network"))}finally{this._isExporting=!1,this.requestUpdate()}}async _exportPresets(e){let t="/api/aqara_advanced_lighting/presets/export";e?.length&&(t+=`?preset_ids=${encodeURIComponent(e.join(","))}`);const i=await this.hass.callWS({type:"auth/sign_path",path:t});window.location.href=i.path}_handleImportClick(){this._fileInputRef||(this._fileInputRef=document.createElement("input"),this._fileInputRef.type="file",this._fileInputRef.accept=".json,application/json",this._fileInputRef.addEventListener("change",e=>{const t=e.target;t.files&&t.files[0]&&this._handleImportFile(t.files[0])})),this._fileInputRef.click()}async _handleImportFile(e){this._isImporting=!0,this.requestUpdate();try{const t=await e.text(),i=JSON.parse(t),s=await this.hass.callApi("POST","aqara_advanced_lighting/presets/import",i),o=Object.values(s.counts).reduce((e,t)=>e+t,0);this._showToast(this._localize("presets.import_success",{count:o.toString()})),await this._loadUserPresets({bypassCache:!0})}catch(e){let t=this._localize("presets.import_error_unknown");e instanceof SyntaxError?t=this._localize("presets.import_error_invalid_file"):e instanceof Error&&(t=e.message),this._showToast(t)}finally{this._isImporting=!1,this.requestUpdate()}}_showToast(e){const t=new CustomEvent("hass-notification",{detail:{message:e,duration:3e3},bubbles:!0,composed:!0});this.dispatchEvent(t)}_renderPresetsTab(){const e=this._userPresets?.effect_presets||[],t=this._userPresets?.segment_pattern_presets||[],i=this._userPresets?.cct_sequence_presets||[],s=this._userPresets?.segment_sequence_presets||[],o=this._userPresets?.dynamic_scene_presets||[],a=e.length+t.length+i.length+s.length+o.length,n="my_presets_overview",r=!this._prefs.state.collapsed[n];return N`
      <ha-expansion-panel
        outlined
        .expanded=${r}
        @expanded-changed=${e=>this._handleExpansionChange(n,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("tabs.presets")}</div>
            <div class="section-subtitle">
              ${this._localize("sections.subtitle_user_presets",{count:a.toString()})}
            </div>
          </div>
        </div>
        <div class="section-content preset-management-content">
          ${this._isSelectMode?N`
              <div class="toolbar-actions toolbar-select-mode">
                <ha-button @click=${()=>this._exitSelectMode()}>
                  <ha-icon icon="mdi:close" slot="icon"></ha-icon>
                  ${this._localize("presets.select_cancel")}
                </ha-button>
                <ha-button @click=${()=>this._toggleSelectAll()}>
                  <ha-icon icon=${this._isAllSelected()?"mdi:checkbox-multiple-blank-outline":"mdi:checkbox-multiple-outline"} slot="icon"></ha-icon>
                  ${this._isAllSelected()?this._localize("presets.deselect_all"):this._localize("presets.select_all")}
                </ha-button>
                <ha-button
                  @click=${()=>this._handleExportSelected()}
                  .disabled=${0===this._selectedPresetIds.size}
                >
                  <ha-icon icon="mdi:download" slot="icon"></ha-icon>
                  ${this._localize("presets.export_selected_button",{count:this._selectedPresetIds.size.toString()})}
                </ha-button>
              </div>
            `:N`
              <div class="toolbar-actions">
                <ha-button
                  @click=${this._handleExportPresets}
                  .disabled=${this._isExporting||this._isImporting}
                >
                  <ha-icon icon="mdi:download" slot="icon"></ha-icon>
                  ${this._isExporting?this._localize("presets.export_progress"):this._localize("presets.export_button")}
                </ha-button>

                <ha-button
                  @click=${this._handleImportClick}
                  .disabled=${this._isExporting||this._isImporting}
                >
                  <ha-icon icon="mdi:upload" slot="icon"></ha-icon>
                  ${this._isImporting?this._localize("presets.import_progress"):this._localize("presets.import_button")}
                </ha-button>

                <ha-button
                  @click=${()=>this._enterSelectMode()}
                  .disabled=${0===a||this._isExporting||this._isImporting}
                >
                  <ha-icon icon="mdi:checkbox-multiple-marked-outline" slot="icon"></ha-icon>
                  ${this._localize("presets.select_button")}
                </ha-button>

                <ha-button
                  @click=${()=>this._restoreAllHiddenPresets()}
                  .disabled=${0===this._prefs.state.hiddenBuiltinPresets.length}
                >
                  <ha-icon icon="mdi:eye-outline" slot="icon"></ha-icon>
                  ${this._localize("presets.restore_hidden_button")}
                  ${this._prefs.state.hiddenBuiltinPresets.length>0?N` (${this._prefs.state.hiddenBuiltinPresets.length})`:""}
                </ha-button>
              </div>
            `}
        </div>
      </ha-expansion-panel>

      ${0===a?N`
            <div class="no-presets">
              <ha-icon icon="mdi:folder-open-outline"></ha-icon>
              <p>${this._localize("presets.no_presets_title")}</p>
              <p>${this._localize("presets.no_presets_description")}</p>
            </div>
          `:N`
            ${this._renderPresetDeviceSections(this._localize("sections.dynamic_effects"),"presets_effects",e,e=>this._editEffectPreset(e),"effect",e=>this._renderUserEffectIcon(e),(e,t)=>this._sortPresets(e,t),e=>this._duplicateUserEffectPreset(e))}

            ${this._renderPresetDeviceSections(this._localize("sections.segment_patterns"),"presets_patterns",t,e=>this._editPatternPreset(e),"segment_pattern",e=>this._renderUserPatternIcon(e),(e,t)=>this._sortPresets(e,t),e=>this._duplicateUserPatternPreset(e))}

            ${i.length>0?this._renderPresetSection(this._localize("sections.cct_sequences"),"presets_cct",i,e=>this._editCCTSequencePreset(e),"cct_sequence",e=>this._renderUserCCTIcon(e),(e,t)=>this._sortPresets(e,t),e=>this._duplicateUserCCTSequencePreset(e)):""}

            ${this._renderPresetDeviceSections(this._localize("sections.segment_sequences"),"presets_segments",s,e=>this._editSegmentSequencePreset(e),"segment_sequence",e=>this._renderUserSegmentSequenceIcon(e),(e,t)=>this._sortPresets(e,t),e=>this._duplicateUserSegmentSequencePreset(e))}

            ${o.length>0?this._renderPresetSection(this._localize("sections.dynamic_scenes"),"presets_scenes",o,e=>this._editDynamicScenePreset(e),"dynamic_scene",e=>this._renderUserDynamicSceneIcon(e),(e,t)=>this._sortPresets(e,t),e=>this._duplicateUserDynamicScenePreset(e)):""}
          `}
    `}_renderPresetDeviceSections(e,t,i,s,o,a,n,r){if(0===i.length)return"";const{ungrouped:l,grouped:c}=this._groupPresetsByDeviceType(i);return N`
      ${l.length>0?this._renderPresetSection(e,t,l,s,o,a,n,r):""}
      ${gi.PRESET_DEVICE_TYPES.map(i=>{const l=c.get(i);if(!l?.length)return"";const d=this._localize(`devices.${i}`);return this._renderPresetSection(`${e}: ${d}`,`${t}_${i}`,l,s,o,a,n,r)})}
    `}_renderPresetSection(e,t,i,s,o,a,n,r){const l=!this._prefs.state.collapsed[t],c=n(i,this._getSortPreference(t));return N`
      <ha-expansion-panel
        outlined
        .expanded=${l}
        @expanded-changed=${e=>this._handleExpansionChange(t,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${e}</div>
            <div class="section-subtitle">${this._localize("presets.presets_count",{count:i.length.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(t)}
          </div>
        </div>
        <div class="section-content preset-grid">
          ${c.map(e=>this._renderPresetCard(e,s,o,a,r))}
        </div>
      </ha-expansion-panel>
    `}_renderPresetCard(e,t,i,s,o){if(this._isSelectMode){const t=this._selectedPresetIds.has(e.id);return N`
        <div
          class="user-preset-card select-mode ${t?"selected":""}"
          title="${e.name}"
          aria-label="${e.name}"
          aria-pressed="${t}"
          @click=${()=>this._togglePresetSelection(e.id)}
        >
          <div class="preset-select-checkbox">
            <ha-icon icon=${t?"mdi:checkbox-marked":"mdi:checkbox-blank-outline"}
            ></ha-icon>
          </div>
          <div class="preset-icon">
            ${s(e)}
          </div>
          <div class="preset-name">${e.name}</div>
        </div>
      `}const a=this._presetEditModeId===e.id;return N`
      <div
        class="user-preset-card ${a?"edit-mode":""}"
        title="${e.name}"
        aria-label="${e.name}"
        @click=${()=>{this._presetEditModeId=a?null:e.id}}
      >
        <div class="preset-card-actions preset-card-actions-left">
          <ha-icon-button
            @click=${i=>{i.stopPropagation(),t(e)}}
            title="${this._localize("tooltips.preset_edit")}"
          >
            <ha-icon icon="mdi:pencil"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-card-actions">
          <ha-icon-button
            @click=${t=>{t.stopPropagation(),o(e)}}
            title="${this._localize("tooltips.preset_duplicate")}"
          >
            <ha-icon icon="mdi:content-copy"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-card-actions preset-card-actions-right">
          <ha-icon-button
            @click=${t=>{t.stopPropagation(),this._deleteUserPreset(i,e.id)}}
            title="${this._localize("tooltips.preset_delete")}"
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </ha-icon-button>
        </div>
        <div class="preset-icon">
          ${s(e)}
        </div>
        <div class="preset-name">${e.name}</div>
      </div>
    `}_editEffectPreset(e){this._clearEditorDraft("effects"),this._editingPreset={type:"effect",preset:e},this._setActiveTab("effects")}_editPatternPreset(e){this._clearEditorDraft("patterns"),this._editingPreset={type:"pattern",preset:e},this._setActiveTab("patterns")}_editCCTSequencePreset(e){this._clearEditorDraft("cct"),this._editingPreset={type:"cct",preset:e},this._setActiveTab("cct")}_editSegmentSequencePreset(e){this._clearEditorDraft("segments"),this._editingPreset={type:"segment",preset:e},this._setActiveTab("segments")}_duplicateUserPreset(e,t,i){const s={...e,id:"",name:`${e.name} ${this._localize("presets.copy_suffix")}`,created_at:"",modified_at:""};this._clearEditorDraft(i),this._editingPreset={type:t,preset:s,isDuplicate:!0},this._setActiveTab(i)}_duplicateUserEffectPreset(e){this._duplicateUserPreset(e,"effect","effects")}_duplicateUserPatternPreset(e){this._duplicateUserPreset(e,"pattern","patterns")}_duplicateUserCCTSequencePreset(e){this._duplicateUserPreset(e,"cct","cct")}_duplicateUserSegmentSequencePreset(e){this._duplicateUserPreset(e,"segment","segments")}_duplicateUserDynamicScenePreset(e){this._duplicateUserPreset(e,"dynamic_scene","scenes")}_editDynamicScenePreset(e){this._clearEditorDraft("scenes"),this._editingPreset={type:"dynamic_scene",preset:e},this._setActiveTab("scenes")}_duplicateBuiltinEffectPreset(e,t){const i=function(e,t,i){const s={id:"",name:`${e.name} ${i}`,effect:e.effect,effect_speed:e.speed,effect_brightness:null!=e.brightness?Math.round(e.brightness/255*100):100,effect_colors:e.colors.map(e=>Re(e[0],e[1],e[2])),device_type:t,created_at:"",modified_at:""};return e.audio_speed_mode&&(s.audio_config={audio_entity:"",audio_sensitivity:e.audio_sensitivity,audio_silence_behavior:e.audio_silence_behavior,audio_speed_mode:e.audio_speed_mode,audio_speed_min:e.audio_speed_min,audio_speed_max:e.audio_speed_max}),s}(e,t,this._localize("presets.copy_suffix"));this._clearEditorDraft("effects"),this._editingPreset={type:"effect",preset:i,isDuplicate:!0},this._setActiveTab("effects")}_getDeviceSegmentCount(e){switch(e){case"t1":return 20;case"t1m":default:return 26;case"t1_strip":return this._getT1StripSegmentCount()}}_duplicateBuiltinPatternPreset(e,t){const i=$t(e,t,this._getDeviceSegmentCount(t),this._localize("presets.copy_suffix"));this._clearEditorDraft("patterns"),this._editingPreset={type:"pattern",preset:i,isDuplicate:!0},this._setActiveTab("patterns")}_duplicateBuiltinCCTSequencePreset(e){const t=function(e,t){const i=e.mode;return{id:"",name:`${e.name} ${t}`,steps:i?[]:(e.steps||[]).map(e=>({...e,brightness:Math.round(e.brightness/255*100)})),loop_mode:e.loop_mode,loop_count:e.loop_count,end_behavior:e.end_behavior,..."solar"===i?{mode:"solar",solar_steps:(e.solar_steps||[]).map(e=>({...e,brightness:Math.round(e.brightness/255*100)}))}:{},..."schedule"===i?{mode:"schedule",schedule_steps:(e.schedule_steps||[]).map(e=>({...e,brightness:Math.round(e.brightness/255*100)}))}:{},created_at:"",modified_at:""}}(e,this._localize("presets.copy_suffix"));this._clearEditorDraft("cct"),this._editingPreset={type:"cct",preset:t,isDuplicate:!0},this._setActiveTab("cct")}_duplicateBuiltinSegmentSequencePreset(e,t){const i=function(e,t,i){return{id:"",name:`${e.name} ${i}`,device_type:t,steps:e.steps.map(e=>({...e})),loop_mode:e.loop_mode,loop_count:e.loop_count,end_behavior:e.end_behavior,created_at:"",modified_at:""}}(e,t,this._localize("presets.copy_suffix"));this._clearEditorDraft("segments"),this._editingPreset={type:"segment",preset:i,isDuplicate:!0},this._setActiveTab("segments")}_duplicateBuiltinDynamicScenePreset(e){const t=function(e,t){const i={id:"",name:`${e.name} ${t}`,colors:e.colors.map(e=>({...e})),transition_time:e.transition_time,hold_time:e.hold_time,distribution_mode:e.distribution_mode,offset_delay:e.offset_delay,random_order:e.random_order,loop_mode:e.loop_mode,loop_count:e.loop_count,end_behavior:e.end_behavior,created_at:"",modified_at:""};return e.audio_color_advance&&(i.audio_entity=e.audio_entity,i.audio_sensitivity=e.audio_sensitivity,i.audio_brightness_curve=e.audio_brightness_curve,i.audio_brightness_min=e.audio_brightness_min,i.audio_brightness_max=e.audio_brightness_max,i.audio_color_advance=e.audio_color_advance,i.audio_transition_speed=e.audio_transition_speed,i.audio_detection_mode=e.audio_detection_mode,i.audio_frequency_zone=e.audio_frequency_zone,i.audio_silence_behavior=e.audio_silence_behavior,i.audio_prediction_aggressiveness=e.audio_prediction_aggressiveness,i.audio_latency_compensation_ms=e.audio_latency_compensation_ms,i.audio_color_by_frequency=e.audio_color_by_frequency,i.audio_rolloff_brightness=e.audio_rolloff_brightness),i}(e,this._localize("presets.copy_suffix"));this._clearEditorDraft("scenes"),this._editingPreset={type:"dynamic_scene",preset:t,isDuplicate:!0},this._setActiveTab("scenes")}get _sortOptions(){return[{value:"custom",label:this._localize("presets.sort_custom")},{value:"name-asc",label:this._localize("presets.sort_name_asc")},{value:"name-desc",label:this._localize("presets.sort_name_desc")},{value:"date-new",label:this._localize("presets.sort_date_new")},{value:"date-old",label:this._localize("presets.sort_date_old")}]}_renderSortDropdown(e){const t=this._getSortPreference(e);return N`
      <ha-selector
        class="sort-select"
        .hass=${this.hass}
        .selector=${{select:{options:this._sortOptions,mode:"dropdown"}}}
        .value=${t}
        @value-changed=${t=>{t.stopPropagation(),t.detail.value&&this._setSortPreference(e,t.detail.value)}}
        @click=${e=>e.stopPropagation()}
      ></ha-selector>
    `}_renderFavoritesSection(){if(!this._presets||!this._userPresets)return"";const e=this._prefs.state.favoritePresets.filter(e=>!this._isBuiltinPresetHidden(e.type,e.id)),t=this._getSelectedDeviceTypes(),i=function(e,t,i,s,o={}){const a=[];for(const n of e){let e,r=null,l=!1;switch(n.type){case"effect":for(const i of["t2_bulb","t1m","t1_strip"]){const s=t.dynamic_effects?.[i]?.find(e=>e.id===n.id);if(s){r=s,e=i;break}}if(!r){const t=i.effect_presets?.find(e=>e.id===n.id);t&&(r=t,l=!0,e=t.device_type)}break;case"segment_pattern":if(r=t.segment_patterns?.find(e=>e.id===n.id)||null,!r){const t=i.segment_pattern_presets?.find(e=>e.id===n.id);t&&(r=t,l=!0,e=t.device_type)}break;case"cct_sequence":r=t.cct_sequences?.find(e=>e.id===n.id)||null,r||(r=i.cct_sequence_presets?.find(e=>e.id===n.id)||null,r&&(l=!0));break;case"segment_sequence":if(r=t.segment_sequences?.find(e=>e.id===n.id)||null,!r){const t=i.segment_sequence_presets?.find(e=>e.id===n.id);t&&(r=t,l=!0,e=t.device_type)}break;case"dynamic_scene":r=t.dynamic_scenes?.find(e=>e.id===n.id)||null,r||(r=i.dynamic_scene_presets?.find(e=>e.id===n.id)||null,r&&(l=!0))}r&&(o.skipCompatibility||jt(n,s,e))&&a.push({ref:n,preset:r,isUser:l,deviceType:e})}return a}(e,this._presets,this._userPresets,t);if(0===i.length)return"";const s="favorite_presets",o=!this._prefs.state.collapsed[s],a=this._getSortPreference(s),n=this._sortResolvedFavorites(i,a),r="custom"===a,l=this._favoriteDrag?.fromId,c=this._favoriteDrag?.toId;return N`
      <ha-expansion-panel
        outlined
        .expanded=${o}
        @expanded-changed=${e=>this._handleExpansionChange(s,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.favorite_presets")}</div>
            <div class="section-subtitle">${this._localize("sections.subtitle_favorites",{count:i.length.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(s)}
          </div>
        </div>
        <div class="section-content">
          ${n.map(({ref:e,preset:t,isUser:i})=>{const s=this._presetEditModeId===e.id,o=l===e.id,a=c===e.id&&l!==e.id;return N`
            <div class="preset-button ${i?"user-preset":"builtin-preset"} ${s?"edit-mode":""} ${o?"drag-source":""} ${a?"drop-target":""}" data-fav-id=${e.id} role="button" tabindex="0" aria-label="${t.name}" @click=${()=>{s?this._presetEditModeId=null:this._activateFavoritePreset(e,t,i)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
              <div class="preset-card-actions preset-card-actions-left">
                ${this._renderFavoriteStar(e.type,e.id)}
              </div>
              ${r?N`
                <div class="preset-card-actions">
                  <ha-icon-button
                    class="favorites-drag-handle"
                    @pointerdown=${t=>this._onFavoriteDragStart(t,e.id)}
                  >
                    <ha-icon icon="mdi:drag"></ha-icon>
                  </ha-icon-button>
                </div>
              `:""}
              <div class="preset-icon">
                ${Zt(e,t,i)}
              </div>
              <div class="preset-name">${t.name}</div>
            </div>
          `})}
        </div>
      </ha-expansion-panel>
    `}_renderDynamicEffectsSection(e,t,i){const s=`dynamic_${e.toLowerCase().replace(/\s+/g,"_")}`,o=!this._prefs.state.collapsed[s],a=this._getUserEffectPresetsForDeviceType(i),n=t.filter(e=>!this._isBuiltinPresetHidden("effect",e.id)),r=a.length+n.length,l=this._getSortPreference(s),c=this._sortPresets(a,l),d=this._sortPresets(n,l);return N`
      <ha-expansion-panel
        outlined
        .expanded=${o}
        @expanded-changed=${e=>this._handleExpansionChange(s,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.dynamic_effects")}: ${e}</div>
            <div class="section-subtitle">${a.length>0?this._localize("sections.subtitle_presets_custom",{count:r.toString(),custom:a.length.toString()}):this._localize("sections.subtitle_presets",{count:r.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(s)}
          </div>
        </div>
        <div class="section-content">
          ${c.map(e=>N`
              <div class="preset-button user-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateUserEffectPreset(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("effect",e.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserEffectIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
          ${d.map(e=>N`
              <div class="preset-button builtin-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateDynamicEffect(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("effect",e.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${t=>{t.stopPropagation(),this._duplicateBuiltinEffectPreset(e,i)}}
                    title="${this._localize("tooltips.preset_duplicate")}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton("effect",e.id)}
                <div class="preset-icon">
                  ${e.audio_speed_mode?N`${this._renderPresetIcon(e.icon,"mdi:lightbulb-on")}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:this._renderPresetIcon(e.icon,"mdi:lightbulb-on")}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
        </div>
      </ha-expansion-panel>
    `}_renderMusicSyncSection(){const e="music_sync",t=!this._prefs.state.collapsed[e];return N`
      <ha-expansion-panel
        outlined
        .expanded=${t}
        @expanded-changed=${t=>this._handleExpansionChange(e,t)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.music_sync")}</div>
            <div class="section-subtitle">${this._localize("music_sync.subtitle")}</div>
          </div>
        </div>
        <div class="section-content music-sync-content">
          <div class="music-sync-left">
            <div class="music-sync-toggle">
              <label class="toggle-label">
                <ha-switch
                  .checked=${this._musicSyncEnabled}
                  @change=${this._handleMusicSyncToggle}
                ></ha-switch>
                <span class="control-label">${this._localize("music_sync.enabled_label")}</span>
              </label>
            </div>

            <div class="music-sync-sensitivity-group ${this._musicSyncEnabled?"":"disabled"}">
              <span class="control-label">${this._localize("music_sync.sensitivity_label")}</span>
              <div class="music-sync-sensitivity">
                <ha-button
                  .disabled=${!this._musicSyncEnabled}
                  @click=${()=>this._handleMusicSyncSensitivity("low")}
                  .appearance=${"low"===this._musicSyncSensitivity?"filled":"outlined"}
                >${this._localize("music_sync.sensitivity_low")}</ha-button>
                <ha-button
                  .disabled=${!this._musicSyncEnabled}
                  @click=${()=>this._handleMusicSyncSensitivity("high")}
                  .appearance=${"high"===this._musicSyncSensitivity?"filled":"outlined"}
                >${this._localize("music_sync.sensitivity_high")}</ha-button>
              </div>
            </div>
          </div>

          <div class="music-sync-right ${this._musicSyncEnabled?"":"disabled"}">
            <span class="control-label">${this._localize("music_sync.effect_label")}</span>
            <div class="music-sync-effects">
              ${[{id:"random",icon:"random.svg"},{id:"blink",icon:"blink.svg"},{id:"rainbow",icon:"rainbow.svg"},{id:"wave",icon:"wave.svg"}].map(e=>N`
                <div
                  class="preset-button ${this._musicSyncEffect===e.id?"music-sync-active":""} ${this._musicSyncEnabled?"":"disabled"}"
                  role="button"
                  tabindex="0"
                  aria-label="${this._localize(`music_sync.effect_${e.id}`)}"
                  aria-disabled="${this._musicSyncEnabled?"false":"true"}"
                  @click=${()=>this._musicSyncEnabled?this._handleMusicSyncEffectSelect(e.id):null}
                >
                  <div class="preset-icon">
                    <div
                      class="effect-icon"
                      style="
                        -webkit-mask-image: url('/api/aqara_advanced_lighting/icons/${e.icon}');
                        mask-image: url('/api/aqara_advanced_lighting/icons/${e.icon}');
                      "
                    ></div>
                  </div>
                  <div class="preset-name">${this._localize(`music_sync.effect_${e.id}`)}</div>
                </div>
              `)}
            </div>
          </div>
        </div>
      </ha-expansion-panel>
    `}async _handleMusicSyncToggle(e){const t=e.target.checked;this._musicSyncEnabled=t;const i=this._prefs.state.selectedEntities.filter(e=>"t1_strip"===this._getEntityDeviceType(e));0!==i.length&&await this.hass.callService("aqara_advanced_lighting","set_music_sync",{entity_id:i,enabled:t,sensitivity:this._musicSyncSensitivity,audio_effect:this._musicSyncEffect})}async _handleMusicSyncSensitivity(e){if(this._musicSyncSensitivity=e,!this._musicSyncEnabled)return;const t=this._prefs.state.selectedEntities.filter(e=>"t1_strip"===this._getEntityDeviceType(e));0!==t.length&&await this.hass.callService("aqara_advanced_lighting","set_music_sync",{entity_id:t,enabled:!0,sensitivity:e,audio_effect:this._musicSyncEffect})}async _handleMusicSyncEffectSelect(e){if(this._musicSyncEffect=e,!this._musicSyncEnabled)return;const t=this._prefs.state.selectedEntities.filter(e=>"t1_strip"===this._getEntityDeviceType(e));0!==t.length&&await this.hass.callService("aqara_advanced_lighting","set_music_sync",{entity_id:t,enabled:!0,sensitivity:this._musicSyncSensitivity,audio_effect:e})}_renderSegmentPatternsSection(e,t,i){const s=`segment_pat_${e.toLowerCase().replace(/\s+/g,"_")}`,o=!this._prefs.state.collapsed[s],a=this._getUserPatternPresetsForDeviceType(i),n=t.filter(e=>!this._isBuiltinPresetHidden("segment_pattern",e.id)),r=a.length+n.length,l=this._getSortPreference(s),c=this._sortPresets(a,l),d=this._sortPresets(n,l);return N`
      <ha-expansion-panel
        outlined
        .expanded=${o}
        @expanded-changed=${e=>this._handleExpansionChange(s,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.segment_patterns")}: ${e}</div>
            <div class="section-subtitle">${a.length>0?this._localize("sections.subtitle_presets_custom",{count:r.toString(),custom:a.length.toString()}):this._localize("sections.subtitle_presets",{count:r.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(s)}
          </div>
        </div>
        <div class="section-content">
          ${c.map(e=>N`
              <div class="preset-button user-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateUserPatternPreset(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("segment_pattern",e.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserPatternIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
          ${d.map(e=>N`
              <div class="preset-button builtin-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateSegmentPattern(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("segment_pattern",e.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${t=>{t.stopPropagation(),this._duplicateBuiltinPatternPreset(e,i)}}
                    title="${this._localize("tooltips.preset_duplicate")}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton("segment_pattern",e.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(e.icon,"mdi:palette")}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
        </div>
      </ha-expansion-panel>
    `}_renderPresetIcon(e,t){return e?e.includes(".")?N`<img src="/api/aqara_advanced_lighting/icons/${e}" alt="preset icon" />`:N`<ha-icon icon="${e}"></ha-icon>`:N`<ha-icon icon="${t}"></ha-icon>`}_renderUserEffectIcon(e){if(e.icon)return this._renderPresetIcon(e.icon,"mdi:lightbulb-on");const t=Ot(e)??N`<ha-icon icon="mdi:lightbulb-on"></ha-icon>`;return e.audio_config?.audio_entity?N`${t}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:t}_renderUserPatternIcon(e){return e.icon?this._renderPresetIcon(e.icon,"mdi:palette"):qt(e)??N`<ha-icon icon="mdi:palette"></ha-icon>`}_renderUserCCTIcon(e){return e.icon?this._renderPresetIcon(e.icon,"mdi:temperature-kelvin"):Rt(e)??N`<ha-icon icon="mdi:temperature-kelvin"></ha-icon>`}_renderUserSegmentSequenceIcon(e){return e.icon?this._renderPresetIcon(e.icon,"mdi:animation-play"):Bt(e)??N`<ha-icon icon="mdi:animation-play"></ha-icon>`}_renderUserDynamicSceneIcon(e){const t=!(!e.audio_entity&&!e.audio_color_advance);if(e.thumbnail){const i=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`;return t?N`${i}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:i}if(e.icon){const i=this._renderPresetIcon(e.icon,"mdi:lamps");return t?N`${i}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:i}const i=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`;return t?N`${i}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:i}_renderBuiltinDynamicSceneIcon(e){const t=Lt(e)??N`<ha-icon icon="mdi:lamps"></ha-icon>`;return e.audio_color_advance?N`${t}<span class="audio-badge"><ha-icon icon="mdi:waveform"></ha-icon></span>`:t}_renderCCTSequencesSection(){const e="cct_sequences",t=!this._prefs.state.collapsed[e],i=this._getFilteredUserCCTSequencePresets(),s=this._presets.cct_sequences.filter(e=>!this._isBuiltinPresetHidden("cct_sequence",e.id)),o=i.length+s.length,a=this._getSortPreference(e),n=this._sortPresets(i,a),r=this._sortPresets(s,a);return N`
      <ha-expansion-panel
        outlined
        .expanded=${t}
        @expanded-changed=${t=>this._handleExpansionChange(e,t)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.cct_sequences")}</div>
            <div class="section-subtitle">${i.length>0?this._localize("sections.subtitle_presets_custom",{count:o.toString(),custom:i.length.toString()}):this._localize("sections.subtitle_presets",{count:o.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(e)}
          </div>
        </div>
        <div class="section-content">
          ${n.map(e=>N`
              <div class="preset-button user-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateUserCCTSequencePreset(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("cct_sequence",e.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserCCTIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
          ${r.map(e=>N`
              <div class="preset-button builtin-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateCCTSequence(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("cct_sequence",e.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${t=>{t.stopPropagation(),this._duplicateBuiltinCCTSequencePreset(e)}}
                    title="${this._localize("tooltips.preset_duplicate")}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton("cct_sequence",e.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(e.icon,"mdi:temperature-kelvin")}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
        </div>
      </ha-expansion-panel>
    `}_renderSegmentSequencesSection(e,t,i){const s=`segment_seq_${e.toLowerCase().replace(/\s+/g,"_")}`,o=!this._prefs.state.collapsed[s],a=this._getUserSegmentSequencePresetsForDeviceType(i),n=t.filter(e=>!this._isBuiltinPresetHidden("segment_sequence",e.id)),r=a.length+n.length,l=this._getSortPreference(s),c=this._sortPresets(a,l),d=this._sortPresets(n,l);return N`
      <ha-expansion-panel
        outlined
        .expanded=${o}
        @expanded-changed=${e=>this._handleExpansionChange(s,e)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.segment_sequences")}: ${e}</div>
            <div class="section-subtitle">${a.length>0?this._localize("sections.subtitle_presets_custom",{count:r.toString(),custom:a.length.toString()}):this._localize("sections.subtitle_presets",{count:r.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(s)}
          </div>
        </div>
        <div class="section-content">
          ${c.map(e=>N`
              <div class="preset-button user-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateUserSegmentSequencePreset(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("segment_sequence",e.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserSegmentSequenceIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
          ${d.map(e=>N`
              <div class="preset-button builtin-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateSegmentSequence(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("segment_sequence",e.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${t=>{t.stopPropagation(),this._duplicateBuiltinSegmentSequencePreset(e,i)}}
                    title="${this._localize("tooltips.preset_duplicate")}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton("segment_sequence",e.id)}
                <div class="preset-icon">
                  ${this._renderPresetIcon(e.icon,"mdi:animation-play")}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
        </div>
      </ha-expansion-panel>
    `}_renderDynamicScenesSection(){const e="dynamic_scenes",t=!this._prefs.state.collapsed[e],i=this._getFilteredUserDynamicScenePresets(),s=(this._presets.dynamic_scenes||[]).filter(e=>!this._isBuiltinPresetHidden("dynamic_scene",e.id)),o=i.length+s.length,a=this._getSortPreference(e),n=this._sortPresets(i,a),r=this._sortPresets(s,a);return N`
      <ha-expansion-panel
        outlined
        .expanded=${t}
        @expanded-changed=${t=>this._handleExpansionChange(e,t)}
      >
        <div slot="header" class="section-header">
          <div>
            <div class="section-title">${this._localize("sections.dynamic_scenes")}</div>
            <div class="section-subtitle">${i.length>0?this._localize("sections.subtitle_presets_custom",{count:o.toString(),custom:i.length.toString()}):this._localize("sections.subtitle_presets",{count:o.toString()})}</div>
          </div>
          <div class="section-header-controls" @click=${e=>e.stopPropagation()}>
            ${this._renderSortDropdown(e)}
          </div>
        </div>
        <div class="section-content">
          ${n.map(e=>N`
              <div class="preset-button user-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateUserDynamicScenePreset(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("dynamic_scene",e.id)}
                </div>
                <div class="preset-icon">
                  ${this._renderUserDynamicSceneIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
          ${r.map(e=>N`
              <div class="preset-button builtin-preset ${this._presetEditModeId===e.id?"edit-mode":""}" role="button" tabindex="0" aria-label="${e.name}" @click=${()=>{this._presetEditModeId===e.id?this._presetEditModeId=null:this._activateDynamicScene(e)}} @touchstart=${()=>this._handlePresetTouchStart(e.id)} @touchend=${e=>this._handlePresetTouchEnd(e)} @touchmove=${this._handlePresetTouchMove}>
                <div class="preset-card-actions preset-card-actions-left">
                  ${this._renderFavoriteStar("dynamic_scene",e.id)}
                </div>
                <div class="preset-card-actions">
                  <ha-icon-button
                    @click=${t=>{t.stopPropagation(),this._duplicateBuiltinDynamicScenePreset(e)}}
                    title="${this._localize("tooltips.preset_duplicate")}"
                  >
                    <ha-icon icon="mdi:content-copy"></ha-icon>
                  </ha-icon-button>
                </div>
                ${this._renderHideButton("dynamic_scene",e.id)}
                <div class="preset-icon">
                  ${this._renderBuiltinDynamicSceneIcon(e)}
                </div>
                <div class="preset-name">${e.name}</div>
              </div>
            `)}
        </div>
      </ha-expansion-panel>
    `}};vi.styles=[ke,Pe,Me,Ae,Te,Ie,De,qe],vi.PRESET_DEVICE_TYPES=["t2_bulb","t1","t1m","t1_strip"],vi.AUDIO_PRESETS={beat:{color_advance:"on_onset",detection_mode:"spectral_flux",sensitivity:60,transition_speed:80,brightness_curve:"linear",brightness_min:30,brightness_max:100,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150},ambient:{color_advance:"intensity_breathing",detection_mode:"spectral_flux",sensitivity:50,transition_speed:20,brightness_curve:"logarithmic",brightness_min:20,brightness_max:80,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!0,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150},concert:{color_advance:"beat_predictive",detection_mode:"complex_domain",sensitivity:50,transition_speed:50,brightness_curve:"linear",brightness_min:30,brightness_max:100,frequency_zone:!0,color_by_frequency:!0,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:70,latency_compensation_ms:150},chill:{color_advance:"continuous",detection_mode:"spectral_flux",sensitivity:40,transition_speed:30,brightness_curve:"logarithmic",brightness_min:20,brightness_max:80,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"slow_cycle",prediction_aggressiveness:50,latency_compensation_ms:150},club:{color_advance:"onset_flash",detection_mode:"bass_energy",sensitivity:70,transition_speed:95,brightness_curve:"exponential",brightness_min:10,brightness_max:100,frequency_zone:!1,color_by_frequency:!1,rolloff_brightness:!1,silence_behavior:"hold",prediction_aggressiveness:50,latency_compensation_ms:150}},e([pe({attribute:!1})],vi.prototype,"hass",void 0),e([pe({type:Boolean,reflect:!0})],vi.prototype,"narrow",void 0),e([_e()],vi.prototype,"_presets",void 0),e([_e()],vi.prototype,"_loading",void 0),e([_e()],vi.prototype,"_error",void 0),e([_e()],vi.prototype,"_hasIncompatibleLights",void 0),e([_e()],vi.prototype,"_favorites",void 0),e([_e()],vi.prototype,"_renamingFavoriteId",void 0),e([_e()],vi.prototype,"_renamingFavoriteName",void 0),e([_e()],vi.prototype,"_favoriteEditModeId",void 0),e([_e()],vi.prototype,"_presetEditModeId",void 0),e([_e()],vi.prototype,"_favoriteDrag",void 0),e([_e()],vi.prototype,"_activeTab",void 0),e([_e()],vi.prototype,"_userPresets",void 0),e([_e()],vi.prototype,"_editingPreset",void 0),e([_e()],vi.prototype,"_effectPreviewActive",void 0),e([_e()],vi.prototype,"_patternPreviewActive",void 0),e([_e()],vi.prototype,"_cctPreviewActive",void 0),e([_e()],vi.prototype,"_audioModeRegistry",void 0),e([_e()],vi.prototype,"_segmentSequencePreviewActive",void 0),e([_e()],vi.prototype,"_scenePreviewActive",void 0),e([_e()],vi.prototype,"_backendVersion",void 0),e([_e()],vi.prototype,"_frontendVersion",void 0),e([_e()],vi.prototype,"_supportedEntities",void 0),e([_e()],vi.prototype,"_deviceZones",void 0),e([_e()],vi.prototype,"_z2mInstances",void 0),e([_e()],vi.prototype,"_isExporting",void 0),e([_e()],vi.prototype,"_isImporting",void 0),e([_e()],vi.prototype,"_isSelectMode",void 0),e([_e()],vi.prototype,"_selectedPresetIds",void 0),e([_e()],vi.prototype,"_runningOperations",void 0),e([_e()],vi.prototype,"_musicSyncEnabled",void 0),e([_e()],vi.prototype,"_musicSyncSensitivity",void 0),e([_e()],vi.prototype,"_musicSyncEffect",void 0),e([_e()],vi.prototype,"_setupComplete",void 0),vi=gi=e([ce("aqara-advanced-lighting-panel")],vi)}();
