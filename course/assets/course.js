document.querySelectorAll('.cmd').forEach(function(b){
  var btn=document.createElement('button');btn.textContent='Copy';
  btn.onclick=function(){navigator.clipboard.writeText(b.querySelector('pre').innerText.replace(/^\$ /gm,'')).then(function(){btn.textContent='Copied';btn.classList.add('done');setTimeout(function(){btn.textContent='Copy';btn.classList.remove('done')},1400)})};
  b.appendChild(btn);
});
