/* empty css                                */import{l as f,b as m,c as g,e as b,g as v,h as k,a as y,i as E,j as $,k as S,m as q,n as w,o as A,d as x}from"../chunks/chunks/vendor/fontawesome.z_C5Drto.js";f.add(m,g,b,v,k,y,E,$,S,q,w,A);x.watch();class L{constructor(){this.filters={search:"",category:"",stock_status:"",status:"",sort:"name-asc",price_min:"",price_max:"",page:1},this.productListContainerId="product-list-container",this.filterFormId="product-filter-form",this.batchActionFormId="product-batch-action-form",this.paginationContainerId="pagination-container",this.productsUrl="/staff/api/products/list/",this.statsUrl="/staff/api/products/stats/",this.debounceTimeout=null,this.filterChangeDelay=500,this.isLoading=!1,this.selectedProducts=new Set,this.allSelected=!1,this.activeEditElement=null,this.previousFocus=null,this.liveRegion=null,this.statusRegion=null}init(){this.setupAccessibility(),this.bindEvents(),this.refreshProductList(),this.refreshProductStats(),typeof bootstrap<"u"&&([...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(i=>new bootstrap.Tooltip(i)),[...document.querySelectorAll('[data-bs-toggle="popover"]')].map(i=>new bootstrap.Popover(i)))}setupAccessibility(){this.createLiveRegions(),this.setupKeyboardNavigation(),this.ensureSkipLinks()}createLiveRegions(){this.liveRegion||(this.liveRegion=document.createElement("div"),this.liveRegion.setAttribute("aria-live","assertive"),this.liveRegion.setAttribute("aria-atomic","true"),this.liveRegion.setAttribute("aria-relevant","text"),this.liveRegion.className="visually-hidden",this.liveRegion.id="product-manager-live-region",document.body.appendChild(this.liveRegion)),this.statusRegion||(this.statusRegion=document.createElement("div"),this.statusRegion.setAttribute("aria-live","polite"),this.statusRegion.setAttribute("aria-atomic","true"),this.statusRegion.className="visually-hidden",this.statusRegion.id="product-manager-status-region",document.body.appendChild(this.statusRegion))}setupKeyboardNavigation(){document.addEventListener("keydown",e=>{e.key==="Escape"&&this.activeEditElement&&this.cancelQuickEdit(),(e.key==="Enter"||e.key===" ")&&e.target.matches(".quick-edit-btn")&&(e.preventDefault(),e.target.click()),e.key==="Tab"&&this.activeEditElement&&this.handleTabNavigation(e),["ArrowUp","ArrowDown"].includes(e.key)&&e.target.closest("tbody")&&this.handleArrowNavigation(e),e.key==="Enter"&&e.target.matches(".product-select-checkbox")&&(e.target.checked=!e.target.checked,e.target.dispatchEvent(new Event("change")))})}ensureSkipLinks(){if(!document.querySelector('a[href="#main-content"]')){const t=document.createElement("a");t.href="#main-content",t.className="visually-hidden-focusable",t.textContent="Skip to main content",t.style.cssText=`
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 100000;
            `,t.addEventListener("focus",()=>{t.style.top="6px"}),t.addEventListener("blur",()=>{t.style.top="-40px"}),document.body.insertBefore(t,document.body.firstChild)}}bindEvents(){const e=document.getElementById(this.filterFormId);if(e){e.querySelectorAll("input, select").forEach(a=>{a.type==="text"||a.type==="number"||a.type==="search"?a.addEventListener("input",()=>this.handleFilterChange(a)):a.addEventListener("change",()=>this.handleFilterChange(a))}),e.addEventListener("submit",a=>{a.preventDefault(),this.refreshProductList()});const i=e.querySelector(".reset-filters");i&&i.addEventListener("click",a=>{a.preventDefault(),this.resetFilters()})}document.addEventListener("click",t=>{if(t.target.matches("#select-all-products")&&this.handleSelectAllToggle(t.target.checked),t.target.matches(".product-select-checkbox")&&this.handleProductSelection(t.target),(t.target.matches("#apply-batch-action")||t.target.closest("#apply-batch-action"))&&this.handleBatchAction(),t.target.matches(".quick-edit-btn")||t.target.closest(".quick-edit-btn")){t.preventDefault();const i=t.target.closest(".quick-edit-btn"),a=i.dataset.productId,n=i.dataset.field;this.openQuickEdit(a,n)}}),document.addEventListener("click",t=>{if(t.target.matches(".page-link")&&!t.target.parentElement.classList.contains("disabled")){t.preventDefault();const i=t.target.getAttribute("href");if(i){const a=new URLSearchParams(i.split("?")[1]);this.filters.page=a.get("page")||1,this.refreshProductList()}}})}handleFilterChange(e){clearTimeout(this.debounceTimeout),this.debounceTimeout=setTimeout(()=>{const t=e.name,i=e.value;this.filters[t]=i,this.filters.page=1,this.refreshProductList()},this.filterChangeDelay)}resetFilters(){this.filters={search:"",category:"",stock_status:"",status:"",sort:"name-asc",price_min:"",price_max:"",page:1};const e=document.getElementById(this.filterFormId);e&&e.reset(),this.refreshProductList()}handleSelectAllToggle(e){this.allSelected=e;const t=document.querySelectorAll(".product-select-checkbox").length;document.querySelectorAll(".product-select-checkbox").forEach(n=>{n.checked=e;const s=n.dataset.productId;e?this.selectedProducts.add(s):this.selectedProducts.delete(s)}),this.updateBatchActionUI();const a=e?`All ${t} products selected`:"All products deselected";this.announceToScreenReader(a,"polite")}handleProductSelection(e){const t=e.dataset.productId,i=e.closest("tr").querySelector("a").textContent.trim();e.checked?(this.selectedProducts.add(t),this.announceToScreenReader(`${i} selected`,"polite")):(this.selectedProducts.delete(t),this.announceToScreenReader(`${i} deselected`,"polite"),document.getElementById("select-all-products").checked=!1,this.allSelected=!1),this.updateBatchActionUI()}updateBatchActionUI(){const e=this.selectedProducts.size,t=document.getElementById("selected-count");t&&(t.textContent=e);const i=document.getElementById("apply-batch-action");i&&(i.disabled=e===0,i.setAttribute("aria-label",e===0?"No products selected for batch action":`Apply batch action to ${e} selected products`));const a=document.getElementById("batch-actions-container");a&&(a.classList.toggle("d-none",e===0),a.setAttribute("aria-hidden",e===0?"true":"false"));const n=document.getElementById("select-all-products"),s=document.querySelectorAll(".product-select-checkbox").length;n&&s>0&&(n.indeterminate=e>0&&e<s,n.checked=e===s)}handleBatchAction(){const e=document.getElementById("batch-action");if(!e)return;const t=e.value;if(!t){this.announceToScreenReader("Please select an action to perform","assertive"),e.focus();return}const i=Array.from(this.selectedProducts),a=i.length;if(["delete","deactivate"].includes(t)&&!confirm(`Are you sure you want to ${t==="delete"?"permanently delete":"deactivate"} ${a} selected product${a>1?"s":""}? This action cannot be undone.`)){this.announceToScreenReader("Batch action cancelled","polite");return}this.announceToScreenReader(`Applying ${t} to ${a} products...`,"assertive"),this.setLoadingState(!0,`Processing ${t} for ${a} products...`),fetch("/staff/api/products/batch-action/",{method:"POST",headers:{"Content-Type":"application/json","X-CSRFToken":this.getCsrfToken()},body:JSON.stringify({action:t,product_ids:i})}).then(n=>n.json()).then(n=>{if(n.success)this.showNotification("success",n.message),this.announceToScreenReader(`Successfully applied ${t} to ${a} products`,"assertive"),this.selectedProducts=new Set,this.allSelected=!1,this.refreshProductList(),this.refreshProductStats();else{const s=n.error||"An error occurred";this.showNotification("danger",s),this.announceToScreenReader(`Error: ${s}`,"assertive")}this.setLoadingState(!1)}).catch(n=>{console.error("Error applying batch action:",n);const s="An error occurred while processing your request";this.showNotification("danger",s),this.announceToScreenReader(`Error: ${s}`,"assertive"),this.setLoadingState(!1)})}openQuickEdit(e,t){this.activeEditElement&&this.cancelQuickEdit();const i=document.querySelector(`tr[data-product-id="${e}"]`);if(!i)return;const a=i.querySelector(`.${t}-cell`);if(!a)return;const n=a.dataset.value||a.textContent.trim(),s=i.querySelector("a").textContent.trim(),l=a.innerHTML,r=a.querySelector(".quick-edit-btn");this.previousFocus=r;let o;if(t==="price"?o=`
                <div class="quick-edit-container" role="form" aria-label="Edit price for ${s}">
                    <label for="quick-edit-${e}-${t}" class="visually-hidden">
                        Price for ${s}
                    </label>
                    <input type="number"
                           id="quick-edit-${e}-${t}"
                           class="form-control form-control-sm quick-edit-input"
                           value="${n}"
                           step="0.01"
                           min="0"
                           aria-describedby="quick-edit-${e}-${t}-help">
                    <div id="quick-edit-${e}-${t}-help" class="visually-hidden">
                        Enter new price and press Save or press Escape to cancel
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-primary btn-sm save-quick-edit"
                                data-field="${t}" data-product-id="${e}"
                                aria-describedby="quick-edit-${e}-${t}-save-help">
                            Save
                        </button>
                        <button class="btn btn-secondary btn-sm cancel-quick-edit"
                                aria-describedby="quick-edit-${e}-${t}-cancel-help">
                            Cancel
                        </button>
                        <div id="quick-edit-${e}-${t}-save-help" class="visually-hidden">
                            Save the new price
                        </div>
                        <div id="quick-edit-${e}-${t}-cancel-help" class="visually-hidden">
                            Cancel editing and restore original value
                        </div>
                    </div>
                </div>
            `:t==="stock_quantity"?o=`
                <div class="quick-edit-container" role="form" aria-label="Edit stock quantity for ${s}">
                    <label for="quick-edit-${e}-${t}" class="visually-hidden">
                        Stock quantity for ${s}
                    </label>
                    <input type="number"
                           id="quick-edit-${e}-${t}"
                           class="form-control form-control-sm quick-edit-input"
                           value="${n}"
                           min="0"
                           aria-describedby="quick-edit-${e}-${t}-help">
                    <div id="quick-edit-${e}-${t}-help" class="visually-hidden">
                        Enter new stock quantity and press Save or press Escape to cancel
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
            `:t==="is_active"&&(o=`
                <div class="quick-edit-container" role="form" aria-label="Edit active status for ${s}">
                    <div class="form-check">
                        <input class="form-check-input quick-edit-input"
                               type="checkbox"
                               id="quick-edit-${e}-${t}"
                               ${n==="true"?"checked":""}
                               aria-describedby="quick-edit-${e}-${t}-help">
                        <label class="form-check-label" for="quick-edit-${e}-${t}">
                            Active
                        </label>
                    </div>
                    <div id="quick-edit-${e}-${t}-help" class="visually-hidden">
                        Toggle active status and press Save or press Escape to cancel
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
            `),o){a.innerHTML=o,this.activeEditElement=a;const c=a.querySelector(".quick-edit-input");c&&(c.focus(),(c.type==="text"||c.type==="number")&&c.select());const d=a.querySelector(".save-quick-edit");d&&d.addEventListener("click",()=>{let h;t==="is_active"?h=a.querySelector(".form-check-input").checked:h=a.querySelector("input").value,this.saveQuickEdit(e,t,h,s)});const p=a.querySelector(".cancel-quick-edit");p&&p.addEventListener("click",()=>{this.cancelQuickEdit(l)}),this.announceToScreenReader(`Editing ${t} for ${s}. Use Tab to navigate, Enter to save, Escape to cancel.`,"assertive")}}cancelQuickEdit(e=null){this.activeEditElement&&(e&&(this.activeEditElement.innerHTML=e),this.previousFocus&&this.previousFocus.isConnected&&this.previousFocus.focus(),this.activeEditElement=null,this.previousFocus=null,this.announceToScreenReader("Edit cancelled","polite"))}handleTabNavigation(e){if(!this.activeEditElement)return;const t=this.activeEditElement.querySelectorAll('input, button, select, textarea, [tabindex]:not([tabindex="-1"])'),i=t[0],a=t[t.length-1];e.shiftKey&&document.activeElement===i?(e.preventDefault(),a.focus()):!e.shiftKey&&document.activeElement===a&&(e.preventDefault(),i.focus())}handleArrowNavigation(e){const t=e.target.closest("tr");if(!t)return;let i=null;if(e.key==="ArrowUp"?i=t.previousElementSibling:e.key==="ArrowDown"&&(i=t.nextElementSibling),i){e.preventDefault();const a=i.querySelector("input, button, a");a&&a.focus()}}validateQuickEditInput(e,t){const i=[];switch(e){case"price":isNaN(t)||t===""?i.push("Price must be a valid number"):Number(t)<0?i.push("Price cannot be negative"):Number(t)>999999.99&&i.push("Price cannot exceed $999,999.99");break;case"stock_quantity":isNaN(t)||t===""?i.push("Stock quantity must be a valid number"):Number.isInteger(Number(t))?Number(t)<0?i.push("Stock quantity cannot be negative"):Number(t)>999999&&i.push("Stock quantity cannot exceed 999,999"):i.push("Stock quantity must be a whole number");break}return i}manageFocus(){return{store:()=>{this.storedFocus=document.activeElement},restore:()=>{this.storedFocus&&this.storedFocus.isConnected&&(this.storedFocus.focus(),this.storedFocus=null)}}}saveQuickEdit(e,t,i,a){var l;const n=this.validateQuickEditInput(t,i);if(n.length>0){const r=n.join(". ");this.announceToScreenReader(`Error: ${r}`,"assertive");const o=this.activeEditElement.querySelector("input");if(o){o.focus(),o.setAttribute("aria-invalid","true"),o.setAttribute("aria-describedby",o.id+"-error");let c=this.activeEditElement.querySelector(".error-message");c||(c=document.createElement("div"),c.className="error-message text-danger small mt-1",c.id=o.id+"-error",c.setAttribute("role","alert"),o.parentNode.insertBefore(c,o.nextSibling)),c.textContent=r}return}const s=(l=this.activeEditElement)==null?void 0:l.querySelector("input");if(s){s.removeAttribute("aria-invalid"),s.removeAttribute("aria-describedby");const r=this.activeEditElement.querySelector(".error-message");r&&r.remove()}this.setLoadingState(!0,`Saving ${t} for ${a}...`),fetch(`/staff/products/${e}/quick-edit/`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded","X-CSRFToken":this.getCsrfToken()},body:new URLSearchParams({field:t,value:i})}).then(r=>r.json()).then(r=>{var o;if(r.success)this.showNotification("success",r.message||"Updated successfully"),this.announceToScreenReader(`Successfully updated ${t} for ${a}`,"assertive"),this.activeEditElement=null,this.previousFocus=null,this.refreshProductList(),["price","stock_quantity","is_active"].includes(t)&&this.refreshProductStats();else{const c=r.error||"An error occurred";this.showNotification("danger",c),this.announceToScreenReader(`Error updating ${t}: ${c}`,"assertive");const d=(o=this.activeEditElement)==null?void 0:o.querySelector("input");d&&(d.focus(),d.setAttribute("aria-invalid","true"))}this.setLoadingState(!1)}).catch(r=>{var d;console.error("Error saving quick edit:",r);const o="An error occurred while saving changes";this.showNotification("danger",o),this.announceToScreenReader(`Error: ${o}`,"assertive");const c=(d=this.activeEditElement)==null?void 0:d.querySelector("input");c&&c.focus(),this.setLoadingState(!1)})}refreshProductList(){this.setLoadingState(!0,"Loading product list...");const e=new URL(this.productsUrl,window.location.origin);Object.keys(this.filters).forEach(t=>{this.filters[t]&&e.searchParams.append(t,this.filters[t])}),fetch(e).then(t=>t.json()).then(t=>{if(t.success){this.renderProductList(t);const i=t.products?t.products.length:0,a=t.pagination?t.pagination.total_count:i,n=t.pagination?` (page ${t.pagination.current_page} of ${t.pagination.total_pages})`:"";this.announceToScreenReader(`Product list updated. Showing ${i} of ${a} products${n}`,"polite")}else this.showNotification("danger",t.error||"An error occurred"),this.announceToScreenReader("Error loading product list","assertive");this.setLoadingState(!1)}).catch(t=>{console.error("Error fetching products:",t),this.showNotification("danger","An error occurred while fetching products"),this.announceToScreenReader("Error loading product list","assertive"),this.setLoadingState(!1)})}refreshProductStats(){fetch(this.statsUrl).then(e=>e.json()).then(e=>{e.success&&this.updateStatCards(e.stats)}).catch(e=>{console.error("Error fetching product stats:",e)})}renderProductList(e){const t=document.getElementById(this.productListContainerId),i=document.getElementById(this.paginationContainerId);if(t)if(e.products&&e.products.length>0){let a=`
                <table class="table table-hover" role="table"
                       aria-label="Product list with ${e.products.length} products">
                    <thead>
                        <tr role="row">
                            <th scope="col" role="columnheader">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox"
                                           id="select-all-products"
                                           aria-label="Select all products on this page">
                                    <label class="form-check-label visually-hidden" for="select-all-products">
                                        Select all products
                                    </label>
                                </div>
                            </th>
                            <th scope="col" role="columnheader">Image</th>
                            <th scope="col" role="columnheader">Name</th>
                            <th scope="col" role="columnheader">Category</th>
                            <th scope="col" role="columnheader">Price</th>
                            <th scope="col" role="columnheader">Stock</th>
                            <th scope="col" role="columnheader">Status</th>
                            <th scope="col" role="columnheader">Actions</th>
                        </tr>
                    </thead>
                    <tbody>`;e.products.forEach(s=>{const l=s.is_active,r=s.image_url||"/static/assets/images/noimage.png";let o="",c="",d="";s.stock_quantity===0?(o="text-danger",c='<i class="fas fa-exclamation-circle text-danger me-1" aria-hidden="true"></i>',d=`Out of stock - ${s.stock_quantity} items`):s.stock_quantity<=5?(o="text-warning",c='<i class="fas fa-exclamation-triangle text-warning me-1" aria-hidden="true"></i>',d=`Low stock - ${s.stock_quantity} items`):d=`In stock - ${s.stock_quantity} items`,a+=`
                    <tr data-product-id="${s.id}" role="row">
                        <td role="gridcell">
                            <div class="form-check">
                                <input class="form-check-input product-select-checkbox"
                                       type="checkbox"
                                       data-product-id="${s.id}"
                                       aria-label="Select ${s.name}">
                                <label class="form-check-label visually-hidden" for="product-${s.id}">
                                    Select ${s.name}
                                </label>
                            </div>
                        </td>
                        <td role="gridcell">
                            <img src="${r}" alt="Product image for ${s.name}"
                                 class="img-thumbnail product-thumbnail" width="50" height="50">
                        </td>
                        <td role="gridcell">
                            <a href="/staff/products/${s.id}/"
                               aria-label="View details for ${s.name}">
                                ${s.name}
                            </a>
                        </td>
                        <td role="gridcell">${s.category_name||"Uncategorized"}</td>
                        <td class="price-cell" data-value="${s.price}" role="gridcell">
                            <span aria-label="Price: $${s.price}">$${s.price}</span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${s.id}" data-field="price"
                                    aria-label="Quick edit price for ${s.name}"
                                    title="Edit price">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit price</span>
                            </button>
                        </td>
                        <td class="stock_quantity-cell ${o}"
                            data-value="${s.stock_quantity}" role="gridcell">
                            <span aria-label="${d}">
                                ${c}${s.stock_quantity}
                            </span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${s.id}" data-field="stock_quantity"
                                    aria-label="Quick edit stock quantity for ${s.name}"
                                    title="Edit stock quantity">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit stock</span>
                            </button>
                        </td>
                        <td class="is_active-cell" data-value="${l}" role="gridcell">
                            <span class="badge ${l?"bg-success":"bg-danger"}"
                                  aria-label="Product status: ${l?"Active":"Inactive"}">
                                ${l?"Active":"Inactive"}
                            </span>
                            <button type="button" class="btn btn-link p-0 ms-2 quick-edit-btn"
                                    data-product-id="${s.id}" data-field="is_active"
                                    aria-label="Quick edit active status for ${s.name}"
                                    title="Edit status">
                                <i class="fas fa-edit" aria-hidden="true"></i>
                                <span class="visually-hidden">Edit status</span>
                            </button>
                        </td>
                        <td role="gridcell">
                            <div class="btn-group" role="group"
                                 aria-label="Actions for ${s.name}">
                                <a href="/staff/products/${s.id}/"
                                   class="btn btn-sm btn-info"
                                   aria-label="View details for ${s.name}"
                                   title="View product details">
                                    <i class="fas fa-eye" aria-hidden="true"></i>
                                    <span class="visually-hidden">View</span>
                                </a>
                                <a href="/staff/products/${s.id}/update/"
                                   class="btn btn-sm btn-primary"
                                   aria-label="Edit ${s.name}"
                                   title="Edit product">
                                    <i class="fas fa-edit" aria-hidden="true"></i>
                                    <span class="visually-hidden">Edit</span>
                                </a>
                            </div>
                        </td>
                    </tr>`}),a+=`
                    </tbody>
                </table>`,t.innerHTML=a,i&&e.pagination&&this.renderPagination(e.pagination,i);const n=document.getElementById("batch-actions-container");n&&n.classList.remove("d-none")}else{t.innerHTML=`
                <div class="alert alert-info" role="alert" aria-live="polite">
                    <i class="fas fa-info-circle me-2" aria-hidden="true"></i>
                    No products found matching your criteria.
                </div>`,i&&(i.innerHTML="");const a=document.getElementById("batch-actions-container");a&&a.classList.add("d-none")}}renderPagination(e,t){if(!e||!t)return;const{current_page:i,total_pages:a,total_count:n}=e;let s=`
            <nav aria-label="Product list pagination" role="navigation">
                <ul class="pagination justify-content-center" role="list">`;i<=1?s+=`
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-disabled="true" aria-label="Previous page (unavailable)">
                            Previous
                        </span>
                    </li>`:s+=`
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${i-1}"
                           aria-label="Go to previous page, page ${i-1}">
                            Previous
                        </a>
                    </li>`;const l=Math.max(1,i-2),r=Math.min(a,i+2);l>1&&(s+=`
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=1" aria-label="Go to first page">1</a>
                    </li>`,l>2&&(s+=`
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-hidden="true">...</span>
                    </li>`));for(let o=l;o<=r;o++)o===i?s+=`
                    <li class="page-item active" role="listitem">
                        <span class="page-link" aria-current="page" aria-label="Current page, page ${o}">
                            ${o}
                        </span>
                    </li>`:s+=`
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${o}" aria-label="Go to page ${o}">${o}</a>
                    </li>`;if(r<a&&(r<a-1&&(s+=`
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-hidden="true">...</span>
                    </li>`),s+=`
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${a}"
                           aria-label="Go to last page, page ${a}">
                            ${a}
                        </a>
                    </li>`),i>=a?s+=`
                    <li class="page-item disabled" role="listitem">
                        <span class="page-link" aria-disabled="true" aria-label="Next page (unavailable)">
                            Next
                        </span>
                    </li>`:s+=`
                    <li class="page-item" role="listitem">
                        <a class="page-link" href="?page=${i+1}"
                           aria-label="Go to next page, page ${i+1}">
                            Next
                        </a>
                    </li>`,s+=`
                </ul>
            </nav>`,n){const o=(i-1)*10+1,c=Math.min(i*10,n);s+=`
                <div class="visually-hidden" aria-live="polite">
                    Showing ${o} to ${c} of ${n} products,
                    page ${i} of ${a}
                </div>`}t.innerHTML=s}updateStatCards(e){if(!e)return;const t=document.getElementById("total-products-stat");t&&e.total_products!==void 0&&(t.textContent=e.total_products);const i=document.getElementById("active-products-stat");i&&e.active_products!==void 0&&(i.textContent=e.active_products);const a=document.getElementById("out-of-stock-stat");a&&e.out_of_stock!==void 0&&(a.textContent=e.out_of_stock);const n=document.getElementById("low-stock-stat");n&&e.low_stock!==void 0&&(n.textContent=e.low_stock);const s=document.getElementById("total-stock-value-stat");s&&e.total_stock_value!==void 0&&(s.textContent=`$${e.total_stock_value.toFixed(2)}`)}setLoadingState(e,t=null){this.isLoading=e;const i=document.getElementById("loading-spinner");i&&(i.style.display=e?"block":"none",i.setAttribute("aria-hidden",e?"false":"true"));const a=document.getElementById(this.productListContainerId);if(a)if(e){a.classList.add("loading"),a.setAttribute("aria-busy","true");let n=a.querySelector(".loading-indicator");n||(n=document.createElement("div"),n.className="loading-indicator visually-hidden",n.setAttribute("aria-live","polite"),n.setAttribute("aria-atomic","true"),a.appendChild(n)),n.textContent=t||"Loading..."}else{a.classList.remove("loading"),a.setAttribute("aria-busy","false");const n=a.querySelector(".loading-indicator");n&&(n.textContent="")}t?this.announceToScreenReader(t,"polite"):e&&this.announceToScreenReader("Loading...","polite")}showNotification(e,t){const i=document.createElement("div"),a=`notification-${Date.now()}`;i.id=a,i.className=`alert alert-${e} alert-dismissible fade show staff-notification`,i.setAttribute("role",e==="danger"?"alert":"status"),i.setAttribute("aria-live",e==="danger"?"assertive":"polite"),i.setAttribute("aria-atomic","true");let n="";switch(e){case"success":n='<i class="fas fa-check-circle me-2" aria-hidden="true"></i>';break;case"danger":n='<i class="fas fa-exclamation-circle me-2" aria-hidden="true"></i>';break;case"warning":n='<i class="fas fa-exclamation-triangle me-2" aria-hidden="true"></i>';break;case"info":n='<i class="fas fa-info-circle me-2" aria-hidden="true"></i>';break}i.innerHTML=`
            ${n}
            <span class="notification-message">${t}</span>
            <button type="button" class="btn-close" data-bs-dismiss="alert"
                    aria-label="Close notification: ${t.replace(/<[^>]*>/g,"")}"></button>
        `,(document.getElementById("notification-container")||document.body).appendChild(i),e==="danger"&&(i.focus(),i.scrollIntoView({behavior:"smooth",block:"nearest"})),setTimeout(()=>{i.parentNode&&(i.classList.remove("show"),setTimeout(()=>{i.parentNode&&i.remove()},300))},e==="danger"?8e3:5e3),this.announceToScreenReader(t.replace(/<[^>]*>/g,""),e==="danger"?"assertive":"polite")}announceToScreenReader(e,t="polite"){const i=t==="assertive"?this.liveRegion:this.statusRegion;i&&(i.textContent="",setTimeout(()=>{i.textContent=e},100))}getCsrfToken(){var t;return((t=document.cookie.split("; ").find(i=>i.startsWith("csrftoken=")))==null?void 0:t.split("=")[1])||""}}document.addEventListener("DOMContentLoaded",()=>{const u=new L;u.init(),window.productManager=u});export{L as S};
