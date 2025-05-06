/* empty css                     */import{M as c,o as i,l,f as d,a as f,b as m,c as g,d as p,e as u,g as h,h as b,i as y,j as E,k as C,m as v,p as L,q as w,r as x,t as S,u as B,v as k,w as I,x as M,y as D,z as P,A,B as T,D as $,E as N,n as O}from"../vendor/chunks/vendor-CQZYIS0i.js";class q{constructor(){this.init()}init(){document.addEventListener("DOMContentLoaded",()=>{this.loadLowStockProducts(),this.initImportExport()})}loadLowStockProducts(){const t=document.getElementById("low-stock-container");if(!t)return;const e=t.querySelector(".spinner-container"),s=document.getElementById("low-stock-table-body");e.classList.remove("d-none"),fetch("/staff/api/products/low-stock/").then(o=>o.json()).then(o=>{if(e.classList.add("d-none"),o.products&&o.products.length>0){let r="";o.products.forEach(a=>{r+=`
                            <tr>
                                <td>
                                    <div class="d-flex align-items-center">
                                        <img src="${a.image_url||"/static/assets/images/noimage.png"}"
                                            alt="${a.name}" class="me-2 product-thumbnail">
                                        <span>${a.name}</span>
                                    </div>
                                </td>
                                <td>${a.category_name}</td>
                                <td>$${a.price}</td>
                                <td class="${a.stock_quantity===0?"text-danger":"text-warning"}">
                                    ${a.stock_quantity===0?'<i class="fas fa-exclamation-circle text-danger me-1"></i>':'<i class="fas fa-exclamation-triangle text-warning me-1"></i>'}
                                    ${a.stock_quantity}
                                </td>
                                <td>
                                    <div class="btn-group">
                                        <a href="/staff/products/${a.id}/" class="btn btn-sm btn-info">
                                            <i class="fas fa-eye"></i>
                                        </a>
                                        <a href="/staff/products/${a.id}/update/" class="btn btn-sm btn-primary">
                                            <i class="fas fa-edit"></i>
                                        </a>
                                    </div>
                                </td>
                            </tr>
                        `}),s.innerHTML=r}else s.innerHTML=`
                        <tr>
                            <td colspan="5" class="text-center py-3">No low stock products found</td>
                        </tr>
                    `}).catch(o=>{console.error("Error loading low stock products:",o),e.classList.add("d-none"),s.innerHTML=`
                    <tr>
                        <td colspan="5" class="text-center py-3 text-danger">
                            Error loading low stock products
                        </td>
                    </tr>
                `})}initImportExport(){const t=document.getElementById("import-products-btn"),e=document.getElementById("export-products-btn"),s=document.getElementById("importProductsModal");if(!t||!e||!s)return;const o=new c(s);t.addEventListener("click",a=>{a.preventDefault(),o.show()}),e.addEventListener("click",a=>{a.preventDefault(),window.location.href="/staff/api/products/export/"});const r=document.getElementById("submitImportBtn");r&&r.addEventListener("click",()=>{const a=document.getElementById("importProductsForm");new FormData(a),a.submit()})}}const _=new q;class J{constructor(){this.charts={},this.initCharts()}initCharts(){document.addEventListener("DOMContentLoaded",()=>{this.initCategoryChart(),this.initPriceChart()})}initCategoryChart(){const t=document.getElementById("categoryChart");if(!t)return;let e=[],s=[];try{const r=t.dataset.labels||"[]",a=t.dataset.values||"[]";console.log("Category chart labels data:",r),console.log("Category chart values data:",a),e=JSON.parse(r),s=JSON.parse(a)}catch(r){console.error("Error parsing category chart data:",r),e=["No Data Available"],s=[1]}const o=t.getContext("2d");this.charts.category=new i(o,{type:"doughnut",data:{labels:e,datasets:[{label:"Products by Category",data:s,backgroundColor:["#4e73df","#1cc88a","#36b9cc","#f6c23e","#e74a3b","#6f42c1","#fd7e14","#20c9a6","#5a5c69","#84a0c6"],hoverOffset:4}]},options:{responsive:!0,plugins:{legend:{position:"right"}}}})}initPriceChart(){const t=document.getElementById("priceChart");if(!t)return;let e=[],s=[];try{const r=t.dataset.labels||"[]",a=t.dataset.values||"[]";console.log("Price chart labels data:",r),console.log("Price chart values data:",a),e=JSON.parse(r),s=JSON.parse(a)}catch(r){console.error("Error parsing price chart data:",r),e=["No Data Available"],s=[0]}const o=t.getContext("2d");this.charts.price=new i(o,{type:"bar",data:{labels:e,datasets:[{label:"Products by Price Range",data:s,backgroundColor:"#4e73df"}]},options:{responsive:!0,scales:{y:{beginAtZero:!0,title:{display:!0,text:"Number of Products"}},x:{title:{display:!0,text:"Price Range"}}}}})}}const H=new J;l.add(d,f,m,g,p,u,h,b,y,E,C,v,L,w,x,S,B,k,I,M,D,P,A,T,$,N);O.watch();class U{constructor(){this.initEventListeners(),this.initBootstrapComponents(),this.dashboard=_,this.charts=H}initEventListeners(){document.addEventListener("DOMContentLoaded",()=>{const t=document.getElementById("sidebarToggle"),e=document.getElementById("staffSidebar");t&&e&&(t.addEventListener("click",()=>{e.classList.toggle("show")}),document.addEventListener("click",o=>{!(e.contains(o.target)||t.contains(o.target))&&e.classList.contains("show")&&e.classList.remove("show")})),document.querySelectorAll(".alert-success").forEach(o=>{setTimeout(()=>{new bootstrap.Alert(o).close()},5e3)}),this.initDeleteStaffModal()})}initBootstrapComponents(){document.addEventListener("DOMContentLoaded",()=>{[].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(s=>new bootstrap.Tooltip(s)),[].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map(s=>new bootstrap.Popover(s))})}initDeleteStaffModal(){const t=document.getElementById("deleteStaffModal");t&&t.addEventListener("show.bs.modal",function(e){const s=e.relatedTarget,o=s.getAttribute("data-staff-id"),r=s.getAttribute("data-staff-name");document.getElementById("staff-name-to-delete").textContent=r,document.getElementById("delete-staff-form").action=`/staff/staff/${o}/delete/`})}}new U;
