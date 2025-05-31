async function m(s,r){const t=document.getElementById(`status-${r}`),c=document.getElementById(`result-${r}`),n=document.getElementById(`test-container-${r}`);try{const o=performance.now();if(s.endsWith(".js"))try{await import(s);const e=performance.now();t.textContent="✅ Success",t.className="badge bg-success",c.innerHTML=`
                    <div class="text-success">
                        <strong>✅ Script loaded successfully</strong><br>
                        Load time: ${(e-o).toFixed(2)}ms<br>
                        URL: <code>${s}</code>
                    </div>
                `,n.className="alert alert-success"}catch(e){throw console.error("Import error:",e),new Error(`Script import failed: ${e.message}`)}else if(s.endsWith(".css")){const e=document.createElement("link");e.rel="stylesheet",e.href=s;const a=new Promise((l,d)=>{e.onload=l,e.onerror=d,setTimeout(()=>d(new Error("CSS load timeout")),1e4)});document.head.appendChild(e),await a;const i=performance.now();t.textContent="✅ Success",t.className="badge bg-success",c.innerHTML=`
                <div class="text-success">
                    <strong>✅ Stylesheet loaded successfully</strong><br>
                    Load time: ${(i-o).toFixed(2)}ms<br>
                    URL: <code>${s}</code>
                </div>
            `,n.className="alert alert-success",document.head.removeChild(e)}else{const e=await fetch(s,{method:"HEAD"}),a=performance.now();if(e.ok)t.textContent="✅ Success",t.className="badge bg-success",c.innerHTML=`
                    <div class="text-success">
                        <strong>✅ File accessible</strong><br>
                        Status: ${e.status} ${e.statusText}<br>
                        Load time: ${(a-o).toFixed(2)}ms<br>
                        URL: <code>${s}</code>
                    </div>
                `,n.className="alert alert-success";else throw new Error(`HTTP ${e.status}: ${e.statusText}`)}}catch(o){console.error(`Test failed for ${s}:`,o),t.textContent="❌ Failed",t.className="badge bg-danger",c.innerHTML=`
            <div class="text-danger">
                <strong>❌ Test failed</strong><br>
                Error: ${o.message}<br>
                URL: <code>${s}</code>
            </div>
        `,n.className="alert alert-danger"}}function u(){document.querySelectorAll("[data-test-url]").forEach(t=>{t.addEventListener("click",function(){const c=this.getAttribute("data-test-url"),n=this.getAttribute("data-test-id");if(c&&n){const o=document.getElementById(`status-${n}`),e=document.getElementById(`result-${n}`),a=document.getElementById(`test-container-${n}`);o.textContent="⏳ Testing...",o.className="badge bg-warning",e.innerHTML='<div class="text-muted">Testing asset...</div>',a.className="alert alert-info",m(c,n)}})}),document.querySelectorAll('[data-auto-test="true"]').forEach(t=>{setTimeout(()=>t.click(),500)})}document.addEventListener("DOMContentLoaded",u);
