(function(){if(window.parent===window)return;var last=0;function post(){var h=document.documentElement.scrollHeight;if(h!==last){last=h;parent.postMessage({scsH:h},'*')}}
if(window.ResizeObserver)new ResizeObserver(post).observe(document.body);window.addEventListener('load',post);
window.addEventListener('hashchange',function(){parent.postMessage({scsTop:1},'*');setTimeout(post,60)});})();
