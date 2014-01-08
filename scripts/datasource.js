var datasource = {
  "banner": "JavaScript Web Development","content": "HTML -- content&emsp;CSS -- style&emsp;Javascript -- behavior",
  "children": [
    {"banner" : "HTML", "content": "Hyper Text Markup Language",
      "children": [
        {"banner": "HTML4.01", "content": "classic html"},
        {"banner": "DHTML", "content": "Dynamic HyperText Markup Language"},
        {"banner": "XHTML", "content": "EXtensible HyperText Markup Language"},
        {"banner": "HTML5", "content": "HTML5 will be the new standard for HTML.",
          "children": [
            {"banner": "New Semantic Tags", "content": "<nav>, <article>, <header>, <section>, <footer>, <aside>, etc..."},
            {"banner": "New Link Relations", "content": "<link rel='icon' href='/favicon.ico' />"},
            {"banner": "Microdata", "content": "<div itemscope itemtype='http://example.org/band'>"},
            {"banner": "ARIA attributes", "content": "<ul id='tree1' role='tree' tabindex='0' >"},
            {"banner": "New Form Elements", "content": "<meter>, <progress>, <output>, etc..."},
            {"banner": "Audio + Video", "content": "<audio src='sound.mp3' controls></audio>"},
            {"banner": "Canvas", "content": "The canvas tag is used to draw graphics, on the fly, on a web page."},
            {"banner": "WebGL", "content": "WebGL is a cross-platform, royalty-free web standard for a low-level 3D graphics API"},
            {"banner": "SVG", "content": "This is an XML namespace, first defined in the Scalable Vector Graphics."}
          ]
        }
      ]
    },
    {"banner" : "CSS", "content": "Cascading Style Sheet",
      "children": [
        {"banner": "CSS2", "content": "DIV + CSS"},
        {"banner": "CSS3", "content": "CSS3 is the latest standard for CSS.",
          "children": [
            {"banner": "New Selectors", "content": ".row:nth-child(even) { background: #dde; }"},
            {"banner": "Display the non-local fonts", "content": "@font-face { font-family: 'Junction'; src: url(Junction02.otf); }"},
            {"banner": "Propose text overflow", "content": "div { text-overflow: ellipsis; }"},
            {"banner": "Multiple Columns Layout", "content": "-webkit-column-count: 2;"},
            {"banner": "Text Stroke", "content": "-webkit-text-stroke-color: red;"},
            {"banner": "Transparent Effect", "content": "color: rgba(255, 0, 0, 0.75);"},
            {"banner": "HSL Color Mode", "content": "color: hsla(128,75%,33%,1.00);"},
            {"banner": "Rounded Borders", "content": "border-radius: 10px;"},
            {"banner": "Gradient Effect", "content": "background: -webkit-gradient(radial, 430 50, 0, 430 50, 200, from(red), to(#000))"},
            {"banner": "Shadow Effect", "content": "text-shadow: rgba(64, 64, 64, 0.5) 0px 0px 0px;"},
            {"banner": "More Powerful Background", "content": "#logo { background: url(logo.gif) center center no-repeat; background-size: auto; }"},
            {"banner": "Transitions", "content": "#box { -webkit-transition: margin-left 1s ease-in-out;} "},
            {"banner": "Transforms -- 2D & 3D", "content": "-webkit-transform: rotateY(45deg); "},
            {"banner": "Animations", "content": "animation: triangle-up-animation 0.2s 1 paused;"}
          ]
        },
        {"banner": "CSS Precompiler", "content": "Preprocessors can allow the use of variables on CSS files.",
          "children": [
            {"banner": "Less", "content": "Less is probably the most well known CSS preprocessor."},
            {"banner": "Sass", "content": "On their website, Sass claims to make CSS fun again."},
            {"banner": "stylus", "content": "Expressive, dynamic, robust CSS"},
            {"banner": "Switc", "content": "Switch is a full featured, production ready CSS preprocessor."},
            {"banner": "CSS Cacheer", "content": "CSS Cacheer is a very cool preprocessor which allows developers to create plugins."},
            {"banner": "CSS Preprocessor", "content": "Another interesting preprocessor, written in PHP 5."},
            {"banner": "DtCSS", "content": "DtCSS speeds up CSS coding by extending the features to CSS."}
          ]
        }
      ]
    },
    {"banner" : "Javascript", "content": "JavaScript is the scripting language of the Web.",
      "children": [
        {"banner": "Ajax", "content": "AJAX = Asynchronous JavaScript and XML."},
        {"banner": "JS APIs in HTML5", "content": "introduce more fun features",
          "children": [
            {"banner": "New Selectors", "content": "var els = document.getElementsByClassName('section');"},
            {"banner": "Web Storage", "content": "window.localStorage['value'] = area.value;"},
            {"banner": "Web SQL Database", "content": "var db = window.openDatabase('Database Name', 'Database Version');"},
            {"banner": "Application Cache", "content": "<html manifest=\"cache-manifest\">"},
            {"banner": "Web Workers", "content": "var worker = new Worker(‘extra_work.js');"},
            {"banner": "Web Sockets", "content": "var socket = new WebSocket(location);"},
            {"banner": "Notifications", "content": "if (window.webkitNotifications.checkPermission() == 0) {"},
            {"banner": "Drag and Drop", "content": "document.addEventListener('dragstart', function(event) {"},
            {"banner": "Geolocation", "content": "if (navigator.geolocation) {"}
          ]
        },
        {"banner": "Templat Engines", "content": "Teh can clean up your code hugely.",
          "children": [
            {"banner": "Mustache", "content": "Mustache is often considered the base for JavaScript templating."},
            {"banner": "Underscore Templates", "content": "It also provides simple templates we can use."},
            {"banner": "EJS", "content": "EJS is inspired by ERB templates and acts much the same."},
            {"banner": "Handlebars", "content": "Handlebars is one of the most popular templating engines and builds on top of Mustache."},
            {"banner": "Jade", "content": "Jade templates are very different in that they depend hugely on indents and whitespace."}
          ]
        },
        {"banner": "Common JS libs/tolls", "content": "I'm sure you'll find something that you'll like",
          "children": [
            {"banner": "jQuery", "content": "jQuery greatly simplifies JavaScript programming"},
            {"banner": "jQuery UI", "content": "Query UI is a curated set of user interface interactions, effects, widgets, and themes."},
            {"banner": "jQuery Mobile", "content": "jQuery Mobile is designed to make responsive web sites and apps."},
            {"banner": "Bootstrap", "content": "Sleek, intuitive, and powerful mobile first front-end framework"},
            {"banner": "Backbone.js", "content": "Backbone.js gives structure to web applications by providing models, collections, views and routers."},
            {"banner": "underscore.js", "content": "Underscore is a utility-belt library for JavaScript."},
            {"banner": "Angular.js", "content": "AngularJS is what HTML would have been, had it been designed for building web-apps"},
            {"banner": "jsTree", "content": "jsTree provides interactive trees."},
            {"banner": "DataTables", "content": "Datables can add advanced interaction controls to any HTML table."},
            {"banner": "jQuery File Upload", "content": "It is the best file upload plugins I've ever met."},
            {"banner": "Highcharts","content": "Highcharts offers intuitive, interactive charts to your web site or web application."},
            {"banner": "Highstock", "content": "Highstock lets you create stock or general timeline charts in pure JavaScript."},
            {"banner": "CU3ER", "content": "CU3ER™ is 3D jQuery Image Slider."},
            {"banner": "Wow Slider", "content": "Awesome slider for noo-coders."},
            {"banner": "Slit Slider", "content": "It help you create a fullscreen slideshow with a twist."},
            {"banner": "Headroom.js", "content": "Give your pages some headroom. Hide your header until you need it."},
            {"banner": "stickUp", "content": "A simple plugin that 'sticks' an element to the top of the browser window while scrolling past it, always keeping it in view."},
            {"banner": "Buttons", "content": "Do more with buttons. Control button states or create groups of buttons for more components like toolbars."},
            {"banner": "LayoutIt!", "content": "Create your frontend code simple and quickly with Bootstrap using our Drag & Drop Interface Builder."},
            {"banner": "Unslider", "content": "Use any HTML in your slides, extend with CSS. You have full control."},
            {"banner": "Bootstrap Switch", "content": "Turn checkboxes and radio buttons in toggle switches."},
            {"banner": "Sco.js", "content": "sco.js is javascript extensions for Twitter Bootstrap that is created to improve the existing Bootstrap components."},
            {"banner": "iCheck", "content": "SUPER CUSTOMIZED CHECKBOXES AND RADIO BUTTONS FOR JQUERY & ZEPTO."},
            {"banner": "bootstrap-wysiwyg", "content": "Tiny bootstrap-compatible WISWYG rich text editor, based on browser execCommand, built originally for MindMup."},
            {"banner": "Charts.js", "content": "Easy, object oriented client side graphs for designers and developers."},
            {"banner": "Responsive Nav","content": "Responsive navigation plugin without library dependencies and with fast touch screen support."},
            {"banner": "Messenger", "content": "Client-side growl-like notifications with actions and auto-retry."},
            {"banner": "Flat UI", "content": "Flat UI is based on Bootstrap, a comfortable, responsive, and functional framework that simplifies the development of websites."},
            {"banner": "Metro UI CSS", "content": "Metro UI CSS a set of styles to create a site with an interface similar to Windows 8."},
            {"banner": "Grumble.js", "content": "grumble.js provides special tooltips."},
            {"banner": "Socket.io", "content": "Socket.IO aims to make realtime apps possible in every browser and mobile device."},
            {"banner": "Node.js", "content": "Node.js enables us to run thousands of user applications."},
            {"banner": "Express.js", "content": "Express is a minimal and flexible node.js web application framework."},
            {"banner": "mongoose", "content": "Elegant MongoDB object modeling for Node.js"},
            {"banner": "JSHint", "content": "JSHint is a tool that helps to detect errors and potential problems in your JavaScript code."},
            {"banner": "Chrome DevTools", "content": "DevToos are a set web authoring and debugging tools built into Google Chrome"},
            {"banner": "Jasmine", "content": "DOM-less simple JavaScript testing framework."},
            {"banner": "Mocha", "content": "the fun, simple, flexible JavaScript test framework"},
            {"banner": "Grunt", "content": "The JavaScript Task Runner."},
            {"banner": "Bower", "content": "Bower is a package manager for the web."},
            {"banner": "Yeoman", "content": "Yeoman is more than just a tool. It's a workflow."}
          ]
        }
      ]
    }
  ]
};