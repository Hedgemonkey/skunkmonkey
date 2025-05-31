/* empty css                                */import{l as u,b as h,c as f,e as m,g as p,h as g,a as b,i as k,j as v,k as y,m as L,n as S,o as E,d as $}from"../chunks/chunks/vendor/fontawesome.z_C5Drto.js";u.add(h,f,m,p,g,b,k,v,y,L,S,E);$.watch();class C{constructor(){this.filters={search:"",category:"",stock_status:"",status:"",sort:"name-asc",price_min:"",price_max:"",page:1},this.productListContainerId="product-list-container",this.filterFormId="product-filter-form",this.batchActionFormId="product-batch-action-form",this.paginationContainerId="pagination-container",this.productsUrl="/staff/api/products/list/",this.statsUrl="/staff/api/products/stats/",this.debounceTimeout=null,this.filterChangeDelay=500,this.isLoading=!1,this.selectedProducts=new Set,this.allSelected=!1}init(){this.bindEvents(),this.refreshProductList(),this.refreshProductStats(),typeof bootstrap<"u"&&([...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(i=>new bootstrap.Tooltip(i)),[...document.querySelectorAll('[data-bs-toggle="popover"]')].map(i=>new bootstrap.Popover(i)))}bindEvents(){const e=document.getElementById(this.filterFormId);if(e){e.querySelectorAll("input, select").forEach(s=>{s.type==="text"||s.type==="number"||s.type==="search"?s.addEventListener("input",()=>this.handleFilterChange(s)):s.addEventListener("change",()=>this.handleFilterChange(s))}),e.addEventListener("submit",s=>{s.preventDefault(),this.refreshProductList()});const i=e.querySelector(".reset-filters");i&&i.addEventListener("click",s=>{s.preventDefault(),this.resetFilters()})}document.addEventListener("click",t=>{if(t.target.matches("#select-all-products")&&this.handleSelectAllToggle(t.target.checked),t.target.matches(".product-select-checkbox")&&this.handleProductSelection(t.target),(t.target.matches("#apply-batch-action")||t.target.closest("#apply-batch-action"))&&this.handleBatchAction(),t.target.matches(".quick-edit-link")||t.target.closest(".quick-edit-link")){t.preventDefault();const i=t.target.closest(".quick-edit-link"),s=i.dataset.productId,c=i.dataset.field;this.openQuickEdit(s,c)}}),document.addEventListener("click",t=>{if(t.target.matches(".page-link")&&!t.target.parentElement.classList.contains("disabled")){t.preventDefault();const i=t.target.getAttribute("href");if(i){const s=new URLSearchParams(i.split("?")[1]);this.filters.page=s.get("page")||1,this.refreshProductList()}}})}handleFilterChange(e){clearTimeout(this.debounceTimeout),this.debounceTimeout=setTimeout(()=>{const t=e.name,i=e.value;this.filters[t]=i,this.filters.page=1,this.refreshProductList()},this.filterChangeDelay)}resetFilters(){this.filters={search:"",category:"",stock_status:"",status:"",sort:"name-asc",price_min:"",price_max:"",page:1};const e=document.getElementById(this.filterFormId);e&&e.reset(),this.refreshProductList()}handleSelectAllToggle(e){this.allSelected=e,document.querySelectorAll(".product-select-checkbox").forEach(i=>{i.checked=e;const s=i.dataset.productId;e?this.selectedProducts.add(s):this.selectedProducts.delete(s)}),this.updateBatchActionUI()}handleProductSelection(e){const t=e.dataset.productId;e.checked?this.selectedProducts.add(t):(this.selectedProducts.delete(t),document.getElementById("select-all-products").checked=!1,this.allSelected=!1),this.updateBatchActionUI()}updateBatchActionUI(){const e=this.selectedProducts.size,t=document.getElementById("selected-count");t&&(t.textContent=e);const i=document.getElementById("apply-batch-action");i&&(i.disabled=e===0);const s=document.getElementById("batch-actions-container");s&&s.classList.toggle("d-none",e===0)}handleBatchAction(){const e=document.getElementById("batch-action");if(!e)return;const t=e.value;if(!t)return;const i=Array.from(this.selectedProducts);["delete","deactivate"].includes(t)&&!confirm(`Are you sure you want to ${t} the selected products?`)||(this.setLoadingState(!0),fetch("/staff/api/products/batch-action/",{method:"POST",headers:{"Content-Type":"application/json","X-CSRFToken":this.getCsrfToken()},body:JSON.stringify({action:t,product_ids:i})}).then(s=>s.json()).then(s=>{s.success?(this.showNotification("success",s.message),this.selectedProducts=new Set,this.allSelected=!1,this.refreshProductList(),this.refreshProductStats()):this.showNotification("danger",s.error||"An error occurred"),this.setLoadingState(!1)}).catch(s=>{console.error("Error applying batch action:",s),this.showNotification("danger","An error occurred while processing your request"),this.setLoadingState(!1)}))}openQuickEdit(e,t){const i=document.querySelector(`tr[data-product-id="${e}"]`);if(!i)return;const s=i.querySelector(`.${t}-cell`);if(!s)return;const c=s.dataset.value||s.textContent.trim(),a=s.innerHTML;let n;if(t==="price"?n=`
                <div class="quick-edit-container">
                    <input type="number" class="form-control form-control-sm"
                           value="${c}" step="0.01" min="0">
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${t}" data-product-id="${e}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `:t==="stock_quantity"?n=`
                <div class="quick-edit-container">
                    <input type="number" class="form-control form-control-sm"
                           value="${c}" min="0">
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${t}" data-product-id="${e}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `:t==="is_active"&&(n=`
                <div class="quick-edit-container">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${c==="true"?"checked":""}>
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${t}" data-product-id="${e}">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit">
                            Cancel
                        </button>
                    </div>
                </div>
            `),n){s.innerHTML=n;const o=s.querySelector(".save-quick-edit");o&&o.addEventListener("click",()=>{let r;t==="is_active"?r=s.querySelector(".form-check-input").checked:r=s.querySelector("input").value,this.saveQuickEdit(e,t,r)});const l=s.querySelector(".cancel-quick-edit");l&&l.addEventListener("click",()=>{s.innerHTML=a})}}saveQuickEdit(e,t,i){this.setLoadingState(!0),fetch(`/staff/products/${e}/quick-edit/`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":this.getCsrfToken()},body:new URLSearchParams({field:t,value:i})}).then(s=>s.json()).then(s=>{s.success?(this.showNotification("success",s.message||"Updated successfully"),this.refreshProductList(),["price","stock_quantity","is_active"].includes(t)&&this.refreshProductStats()):(this.showNotification("danger",s.error||"An error occurred"),this.refreshProductList()),this.setLoadingState(!1)}).catch(s=>{console.error("Error saving quick edit:",s),this.showNotification("danger","An error occurred while saving changes"),this.refreshProductList(),this.setLoadingState(!1)})}refreshProductList(){this.setLoadingState(!0);const e=new URL(this.productsUrl,window.location.origin);Object.keys(this.filters).forEach(t=>{this.filters[t]&&e.searchParams.append(t,this.filters[t])}),fetch(e).then(t=>t.json()).then(t=>{t.success?this.renderProductList(t):this.showNotification("danger",t.error||"An error occurred"),this.setLoadingState(!1)}).catch(t=>{console.error("Error fetching products:",t),this.showNotification("danger","An error occurred while fetching products"),this.setLoadingState(!1)})}refreshProductStats(){fetch(this.statsUrl).then(e=>e.json()).then(e=>{e.success&&this.updateStatCards(e.stats)}).catch(e=>{console.error("Error fetching product stats:",e)})}renderProductList(e){const t=document.getElementById(this.productListContainerId),i=document.getElementById(this.paginationContainerId);if(t)if(e.products&&e.products.length>0){let s=`
                <table class="table table-hover">
                    <thead>
                        <tr>
                            <th>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="select-all-products">
                                    <label class="form-check-label" for="select-all-products"></label>
                                </div>
                            </th>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;e.products.forEach(a=>{const n=a.is_active,o=a.image_url||"/static/assets/images/noimage.png";let l="",r="";a.stock_quantity===0?(l="text-danger",r='<i class="fas fa-exclamation-circle text-danger me-1"></i>'):a.stock_quantity<=5&&(l="text-warning",r='<i class="fas fa-exclamation-triangle text-warning me-1"></i>'),s+=`
                    <tr data-product-id="${a.id}">
                        <td>
                            <div class="form-check">
                                <input class="form-check-input product-select-checkbox" type="checkbox"
                                       data-product-id="${a.id}">
                            </div>
                        </td>
                        <td>
                            <img src="${o}" alt="${a.name}"
                                 class="img-thumbnail product-thumbnail" width="50">
                        </td>
                        <td>
                            <a href="/staff/products/${a.id}/">
                                ${a.name}
                            </a>
                        </td>
                        <td>${a.category_name}</td>
                        <td class="price-cell" data-value="${a.price}">
                            $${a.price}
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${a.id}" data-field="price">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td class="stock_quantity-cell ${l}"
                            data-value="${a.stock_quantity}">
                            ${r}${a.stock_quantity}
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${a.id}" data-field="stock_quantity">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td class="is_active-cell" data-value="${n}">
                            <span class="badge ${n?"bg-success":"bg-danger"}">
                                ${n?"Active":"Inactive"}
                            </span>
                            <a href="#" class="quick-edit-link ms-2"
                               data-product-id="${a.id}" data-field="is_active">
                                <i class="fas fa-edit"></i>
                            </a>
                        </td>
                        <td>
                            <div class="btn-group">
                                <a href="/staff/products/${a.id}/"
                                   class="btn btn-sm btn-info" title="View">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="/staff/products/${a.id}/update/"
                                   class="btn btn-sm btn-primary" title="Edit">
                                    <i class="fas fa-edit"></i>
                                </a>
                            </div>
                        </td>
                    </tr>`}),s+=`
                    </tbody>
                </table>`,t.innerHTML=s,i&&e.pagination&&this.renderPagination(e.pagination,i);const c=document.getElementById("batch-actions-container");c&&c.classList.remove("d-none")}else{t.innerHTML=`
                <div class="alert alert-info">
                    No products found matching your criteria.
                </div>`,i&&(i.innerHTML="");const s=document.getElementById("batch-actions-container");s&&s.classList.add("d-none")}}renderPagination(e,t){if(!e||!t)return;const{current_page:i,total_pages:s}=e;let c=`
            <nav aria-label="Product pagination">
                <ul class="pagination justify-content-center">`;c+=`
                    <li class="page-item ${i<=1?"disabled":""}">
                        <a class="page-link" href="?page=${i-1}" tabindex="-1">
                            Previous
                        </a>
                    </li>`;const a=Math.max(1,i-2),n=Math.min(s,i+2);a>1&&(c+=`
                    <li class="page-item">
                        <a class="page-link" href="?page=1">1</a>
                    </li>`,a>2&&(c+=`
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>`));for(let o=a;o<=n;o++)c+=`
                    <li class="page-item ${o===i?"active":""}">
                        <a class="page-link" href="?page=${o}">${o}</a>
                    </li>`;n<s&&(n<s-1&&(c+=`
                    <li class="page-item disabled">
                        <span class="page-link">...</span>
                    </li>`),c+=`
                    <li class="page-item">
                        <a class="page-link" href="?page=${s}">${s}</a>
                    </li>`),c+=`
                    <li class="page-item ${i>=s?"disabled":""}">
                        <a class="page-link" href="?page=${i+1}">Next</a>
                    </li>
                </ul>
            </nav>`,t.innerHTML=c}updateStatCards(e){if(!e)return;const t=document.getElementById("total-products-stat");t&&e.total_products!==void 0&&(t.textContent=e.total_products);const i=document.getElementById("active-products-stat");i&&e.active_products!==void 0&&(i.textContent=e.active_products);const s=document.getElementById("out-of-stock-stat");s&&e.out_of_stock!==void 0&&(s.textContent=e.out_of_stock);const c=document.getElementById("low-stock-stat");c&&e.low_stock!==void 0&&(c.textContent=e.low_stock);const a=document.getElementById("total-stock-value-stat");a&&e.total_stock_value!==void 0&&(a.textContent=`$${e.total_stock_value.toFixed(2)}`)}setLoadingState(e){this.isLoading=e;const t=document.getElementById("loading-spinner");t&&(t.style.display=e?"block":"none");const i=document.getElementById(this.productListContainerId);i&&(e?i.classList.add("loading"):i.classList.remove("loading"))}showNotification(e,t){const i=document.createElement("div");i.className=`alert alert-${e} alert-dismissible fade show staff-notification`,i.role="alert",i.innerHTML=`
            ${t}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `,(document.getElementById("notification-container")||document.body).appendChild(i),setTimeout(()=>{i.classList.remove("show"),setTimeout(()=>{i.remove()},300)},5e3)}getCsrfToken(){var t;return((t=document.cookie.split("; ").find(i=>i.startsWith("csrftoken=")))==null?void 0:t.split("=")[1])||""}}document.addEventListener("DOMContentLoaded",()=>{const d=new C;d.init(),window.productManager=d});export{C as S};
