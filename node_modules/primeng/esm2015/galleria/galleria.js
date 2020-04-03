var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { NgModule, Component, ElementRef, AfterViewChecked, AfterViewInit, OnDestroy, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomHandler } from 'primeng/dom';
let Galleria = class Galleria {
    constructor(el) {
        this.el = el;
        this.panelWidth = 600;
        this.panelHeight = 400;
        this.frameWidth = 60;
        this.frameHeight = 40;
        this.activeIndex = 0;
        this.showFilmstrip = true;
        this.autoPlay = true;
        this.transitionInterval = 4000;
        this.showCaption = true;
        this.effectDuration = 500;
        this.onImageClicked = new EventEmitter();
        this.onImageChange = new EventEmitter();
        this.stripLeft = 0;
    }
    ngAfterViewChecked() {
        if (this.imagesChanged) {
            this.stopSlideshow();
            Promise.resolve(null).then(() => {
                this.render();
                this.imagesChanged = false;
            });
        }
    }
    get images() {
        return this._images;
    }
    set images(value) {
        this._images = value;
        this.imagesChanged = true;
        if (this.initialized) {
            this.activeIndex = 0;
        }
    }
    ngAfterViewInit() {
        this.container = this.el.nativeElement.children[0];
        this.panelWrapper = DomHandler.findSingle(this.el.nativeElement, 'ul.ui-galleria-panel-wrapper');
        this.initialized = true;
        if (this.showFilmstrip) {
            this.stripWrapper = DomHandler.findSingle(this.container, 'div.ui-galleria-filmstrip-wrapper');
            this.strip = DomHandler.findSingle(this.stripWrapper, 'ul.ui-galleria-filmstrip');
        }
        if (this.images && this.images.length) {
            this.render();
        }
    }
    render() {
        this.panels = DomHandler.find(this.panelWrapper, 'li.ui-galleria-panel');
        if (this.showFilmstrip) {
            this.frames = DomHandler.find(this.strip, 'li.ui-galleria-frame');
            this.stripWrapper.style.width = DomHandler.width(this.panelWrapper) - 50 + 'px';
            this.stripWrapper.style.height = this.frameHeight + 'px';
        }
        if (this.showCaption) {
            this.caption = DomHandler.findSingle(this.container, 'div.ui-galleria-caption');
            this.caption.style.bottom = this.showFilmstrip ? DomHandler.getOuterHeight(this.stripWrapper, true) + 'px' : 0 + 'px';
            this.caption.style.width = DomHandler.width(this.panelWrapper) + 'px';
        }
        if (this.autoPlay) {
            this.startSlideshow();
        }
        this.container.style.visibility = 'visible';
    }
    startSlideshow() {
        this.interval = setInterval(() => {
            this.next();
        }, this.transitionInterval);
        this.slideshowActive = true;
    }
    stopSlideshow() {
        if (this.interval) {
            clearInterval(this.interval);
        }
        this.slideshowActive = false;
    }
    clickNavRight() {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }
        this.next();
    }
    clickNavLeft() {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }
        this.prev();
    }
    frameClick(frame) {
        if (this.slideshowActive) {
            this.stopSlideshow();
        }
        this.select(DomHandler.index(frame), false);
    }
    prev() {
        if (this.activeIndex !== 0) {
            this.select(this.activeIndex - 1, true);
        }
    }
    next() {
        if (this.activeIndex !== (this.panels.length - 1)) {
            this.select(this.activeIndex + 1, true);
        }
        else {
            this.select(0, false);
            this.stripLeft = 0;
        }
    }
    select(index, reposition) {
        if (index !== this.activeIndex) {
            let oldPanel = this.panels[this.activeIndex], newPanel = this.panels[index];
            DomHandler.fadeIn(newPanel, this.effectDuration);
            if (this.showFilmstrip) {
                let oldFrame = this.frames[this.activeIndex], newFrame = this.frames[index];
                if (reposition === undefined || reposition === true) {
                    let frameLeft = newFrame.offsetLeft, stepFactor = this.frameWidth + parseInt(getComputedStyle(newFrame)['margin-right'], 10), stripLeft = this.strip.offsetLeft, frameViewportLeft = frameLeft + stripLeft, frameViewportRight = frameViewportLeft + this.frameWidth;
                    if (frameViewportRight > DomHandler.width(this.stripWrapper))
                        this.stripLeft -= stepFactor;
                    else if (frameViewportLeft < 0)
                        this.stripLeft += stepFactor;
                }
            }
            this.activeIndex = index;
            this.onImageChange.emit({ index: index });
        }
    }
    clickImage(event, image, i) {
        this.onImageClicked.emit({ originalEvent: event, image: image, index: i });
    }
    ngOnDestroy() {
        this.stopSlideshow();
    }
};
Galleria.ctorParameters = () => [
    { type: ElementRef }
];
__decorate([
    Input()
], Galleria.prototype, "style", void 0);
__decorate([
    Input()
], Galleria.prototype, "styleClass", void 0);
__decorate([
    Input()
], Galleria.prototype, "panelWidth", void 0);
__decorate([
    Input()
], Galleria.prototype, "panelHeight", void 0);
__decorate([
    Input()
], Galleria.prototype, "frameWidth", void 0);
__decorate([
    Input()
], Galleria.prototype, "frameHeight", void 0);
__decorate([
    Input()
], Galleria.prototype, "activeIndex", void 0);
__decorate([
    Input()
], Galleria.prototype, "showFilmstrip", void 0);
__decorate([
    Input()
], Galleria.prototype, "autoPlay", void 0);
__decorate([
    Input()
], Galleria.prototype, "transitionInterval", void 0);
__decorate([
    Input()
], Galleria.prototype, "showCaption", void 0);
__decorate([
    Input()
], Galleria.prototype, "effectDuration", void 0);
__decorate([
    Output()
], Galleria.prototype, "onImageClicked", void 0);
__decorate([
    Output()
], Galleria.prototype, "onImageChange", void 0);
__decorate([
    Input()
], Galleria.prototype, "images", null);
Galleria = __decorate([
    Component({
        selector: 'p-galleria',
        template: `
        <div [ngClass]="{'ui-galleria ui-widget ui-widget-content ui-corner-all':true}" [ngStyle]="style" [class]="styleClass" [style.width.px]="panelWidth">
            <ul class="ui-galleria-panel-wrapper" [style.width.px]="panelWidth" [style.height.px]="panelHeight">
                <li *ngFor="let image of images;let i=index" class="ui-galleria-panel" [ngClass]="{'ui-helper-hidden':i!=activeIndex}"
                    [style.width.px]="panelWidth" [style.height.px]="panelHeight" (click)="clickImage($event,image,i)">
                    <img class="ui-panel-images" [src]="image.source" [alt]="image.alt" [title]="image.title"/>
                </li>
            </ul>
            <div [ngClass]="{'ui-galleria-filmstrip-wrapper':true}" *ngIf="showFilmstrip">
                <ul class="ui-galleria-filmstrip" style="transition:left 1s" [style.left.px]="stripLeft">
                    <li #frame *ngFor="let image of images;let i=index" [ngClass]="{'ui-galleria-frame-active':i==activeIndex}" class="ui-galleria-frame" (click)="frameClick(frame)"
                        [style.width.px]="frameWidth" [style.height.px]="frameHeight" [style.transition]="'opacity 0.75s ease'">
                        <div class="ui-galleria-frame-content">
                            <img [src]="image.source" [alt]="image.alt" [title]="image.title" class="ui-galleria-frame-image"
                                [style.width.px]="frameWidth" [style.height.px]="frameHeight">
                        </div>
                    </li>
                </ul>
            </div>
            <div class="ui-galleria-nav-prev pi pi-fw pi-chevron-left" (click)="clickNavLeft()" [style.bottom.px]="frameHeight/2" *ngIf="activeIndex !== 0"></div>
            <div class="ui-galleria-nav-next pi pi-fw pi-chevron-right" (click)="clickNavRight()" [style.bottom.px]="frameHeight/2"></div>
            <div class="ui-galleria-caption" *ngIf="showCaption&&images" style="display:block">
                <h4>{{images[activeIndex]?.title}}</h4><p>{{images[activeIndex]?.alt}}</p>
            </div>
        </div>
    `,
        changeDetection: ChangeDetectionStrategy.Default
    })
], Galleria);
export { Galleria };
let GalleriaModule = class GalleriaModule {
};
GalleriaModule = __decorate([
    NgModule({
        imports: [CommonModule],
        exports: [Galleria],
        declarations: [Galleria]
    })
], GalleriaModule);
export { GalleriaModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2FsbGVyaWEuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9wcmltZW5nL2dhbGxlcmlhLyIsInNvdXJjZXMiOlsiZ2FsbGVyaWEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLGdCQUFnQixFQUFDLGFBQWEsRUFBQyxTQUFTLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxZQUFZLEVBQUMsdUJBQXVCLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkosT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFnQ3ZDLElBQWEsUUFBUSxHQUFyQixNQUFhLFFBQVE7SUF3RGpCLFlBQW1CLEVBQWM7UUFBZCxPQUFFLEdBQUYsRUFBRSxDQUFZO1FBbER4QixlQUFVLEdBQVcsR0FBRyxDQUFDO1FBRXpCLGdCQUFXLEdBQVcsR0FBRyxDQUFDO1FBRTFCLGVBQVUsR0FBVyxFQUFFLENBQUM7UUFFeEIsZ0JBQVcsR0FBVyxFQUFFLENBQUM7UUFFekIsZ0JBQVcsR0FBVyxDQUFDLENBQUM7UUFFeEIsa0JBQWEsR0FBWSxJQUFJLENBQUM7UUFFOUIsYUFBUSxHQUFZLElBQUksQ0FBQztRQUV6Qix1QkFBa0IsR0FBVyxJQUFJLENBQUM7UUFFbEMsZ0JBQVcsR0FBWSxJQUFJLENBQUM7UUFFNUIsbUJBQWMsR0FBVyxHQUFHLENBQUM7UUFFNUIsbUJBQWMsR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBRXBDLGtCQUFhLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQXNCdEMsY0FBUyxHQUFXLENBQUMsQ0FBQztJQU1PLENBQUM7SUFFckMsa0JBQWtCO1FBQ2QsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQztZQUNyQixPQUFPLENBQUMsT0FBTyxDQUFD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QUU1QjtJQUFSLEtBQUssRUFBRTtnREFBOEI7QUFFNUI7SUFBVCxNQUFNLEVBQUU7Z0RBQXFDO0FBRXBDO0lBQVQsTUFBTSxFQUFFOytDQUFvQztBQXdDcEM7SUFBUixLQUFLLEVBQUU7c0NBRVA7QUF0RVEsUUFBUTtJQTlCcEIsU0FBUyxDQUFDO1FBQ1AsUUFBUSxFQUFFLFlBQVk7UUFDdEIsUUFBUSxFQUFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBeUJUO1FBQ0QsZUFBZSxFQUFFLHVCQUF1QixDQUFDLE9BQU87S0FDbkQsQ0FBQztHQUNXLFFBQVEsQ0FrTnBCO1NBbE5ZLFFBQVE7QUF5TnJCLElBQWEsY0FBYyxHQUEzQixNQUFhLGNBQWM7Q0FBSSxDQUFBO0FBQWxCLGNBQWM7SUFMMUIsUUFBUSxDQUFDO1FBQ04sT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3ZCLE9BQU8sRUFBRSxDQUFDLFFBQVEsQ0FBQztRQUNuQixZQUFZLEVBQUUsQ0FBQyxRQUFRLENBQUM7S0FDM0IsQ0FBQztHQUNXLGNBQWMsQ0FBSTtTQUFsQixjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtOZ01vZHVsZSxDb21wb25lbnQsRWxlbWVudFJlZixBZnRlclZpZXdDaGVja2VkLEFmdGVyVmlld0luaXQsT25EZXN0cm95LElucHV0LE91dHB1dCxFdmVudEVtaXR0ZXIsQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtDb21tb25Nb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge0RvbUhhbmRsZXJ9IGZyb20gJ3ByaW1lbmcvZG9tJztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdwLWdhbGxlcmlhJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsndWktZ2FsbGVyaWEgdWktd2lkZ2V0IHVpLXdpZGdldC1jb250ZW50IHVpLWNvcm5lci1hbGwnOnRydWV9XCIgW25nU3R5bGVdPVwic3R5bGVcIiBbY2xhc3NdPVwic3R5bGVDbGFzc1wiIFtzdHlsZS53aWR0aC5weF09XCJwYW5lbFdpZHRoXCI+XG4gICAgICAgICAgICA8dWwgY2xhc3M9XCJ1aS1nYWxsZXJpYS1wYW5lbC13cmFwcGVyXCIgW3N0eWxlLndpZHRoLnB4XT1cInBhbmVsV2lkdGhcIiBbc3R5bGUuaGVpZ2h0LnB4XT1cInBhbmVsSGVpZ2h0XCI+XG4gICAgICAgICAgICAgICAgPGxpICpuZ0Zvcj1cImxldCBpbWFnZSBvZiBpbWFnZXM7bGV0IGk9aW5kZXhcIiBjbGFzcz1cInVpLWdhbGxlcmlhLXBhbmVsXCIgW25nQ2xhc3NdPVwieyd1aS1oZWxwZXItaGlkZGVuJzppIT1hY3RpdmVJbmRleH1cIlxuICAgICAgICAgICAgICAgICAgICBbc3R5bGUud2lkdGgucHhdPVwicGFuZWxXaWR0aFwiIFtzdHlsZS5oZWlnaHQucHhdPVwicGFuZWxIZWlnaHRcIiAoY2xpY2spPVwiY2xpY2tJbWFnZSgkZXZlbnQsaW1hZ2UsaSlcIj5cbiAgICAgICAgICAgICAgICAgICAgPGltZyBjbGFzcz1cInVpLXBhbmVsLWltYWdlc1wiIFtzcmNdPVwiaW1hZ2Uuc291cmNlXCIgW2FsdF09XCJpbWFnZS5hbHRcIiBbdGl0bGVdPVwiaW1hZ2UudGl0bGVcIi8+XG4gICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICAgICA8ZGl2IFtuZ0NsYXNzXT1cInsndWktZ2FsbGVyaWEtZmlsbXN0cmlwLXdyYXBwZXInOnRydWV9XCIgKm5nSWY9XCJzaG93RmlsbXN0cmlwXCI+XG4gICAgICAgICAgICAgICAgPHVsIGNsYXNzPVwidWktZ2FsbGVyaWEtZmlsbXN0cmlwXCIgc3R5bGU9XCJ0cmFuc2l0aW9uOmxlZnQgMXNcIiBbc3R5bGUubGVmdC5weF09XCJzdHJpcExlZnRcIj5cbiAgICAgICAgICAgICAgICAgICAgPGxpICNmcmFtZSAqbmdGb3I9XCJsZXQgaW1hZ2Ugb2YgaW1hZ2VzO2xldCBpPWluZGV4XCIgW25nQ2xhc3NdPVwieyd1aS1nYWxsZXJpYS1mcmFtZS1hY3RpdmUnOmk9PWFjdGl2ZUluZGV4fVwiIGNsYXNzPVwidWktZ2FsbGVyaWEtZnJhbWVcIiAoY2xpY2spPVwiZnJhbWVDbGljayhmcmFtZSlcIlxuICAgICAgICAgICAgICAgICAgICAgICAgW3N0eWxlLndpZHRoLnB4XT1cImZyYW1lV2lkdGhcIiBbc3R5bGUuaGVpZ2h0LnB4XT1cImZyYW1lSGVpZ2h0XCIgW3N0eWxlLnRyYW5zaXRpb25dPVwiJ29wYWNpdHkgMC43NXMgZWFzZSdcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1nYWxsZXJpYS1mcmFtZS1jb250ZW50XCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGltZyBbc3JjXT1cImltYWdlLnNvdXJjZVwiIFthbHRdPVwiaW1hZ2UuYWx0XCIgW3RpdGxlXT1cImltYWdlLnRpdGxlXCIgY2xhc3M9XCJ1aS1nYWxsZXJpYS1mcmFtZS1pbWFnZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtzdHlsZS53aWR0aC5weF09XCJmcmFtZVdpZHRoXCIgW3N0eWxlLmhlaWdodC5weF09XCJmcmFtZUhlaWdodFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgPC91bD5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWdhbGxlcmlhLW5hdi1wcmV2IHBpIHBpLWZ3IHBpLWNoZXZyb24tbGVmdFwiIChjbGljayk9XCJjbGlja05hdkxlZnQoKVwiIFtzdHlsZS5ib3R0b20ucHhdPVwiZnJhbWVIZWlnaHQvMlwiICpuZ0lmPVwiYWN0aXZlSW5kZXggIT09IDBcIj48L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJ1aS1nYWxsZXJpYS1uYXYtbmV4dCBwaSBwaS1mdyBwaS1jaGV2cm9uLXJpZ2h0XCIgKGNsaWNrKT1cImNsaWNrTmF2UmlnaHQoKVwiIFtzdHlsZS5ib3R0b20ucHhdPVwiZnJhbWVIZWlnaHQvMlwiPjwvZGl2PlxuICAgICAgICAgICAgPGRpdiBjbGFzcz1cInVpLWdhbGxlcmlhLWNhcHRpb25cIiAqbmdJZj1cInNob3dDYXB0aW9uJiZpbWFnZXNcIiBzdHlsZT1cImRpc3BsYXk6YmxvY2tcIj5cbiAgICAgICAgICAgICAgICA8aDQ+e3tpbWFnZXNbYWN0aXZlSW5kZXhdPy50aXRsZX19PC9oND48cD57e2ltYWdlc1thY3RpdmVJbmRleF0/LmFsdH19PC9wPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgIGAsXG4gICAgY2hhbmdlRGV0ZWN0aW9uOiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0XG59KVxuZXhwb3J0IGNsYXNzIEdhbGxlcmlhIGltcGxlbWVudHMgQWZ0ZXJWaWV3Q2hlY2tlZCxBZnRlclZpZXdJbml0LE9uRGVzdHJveSB7XG4gICAgICAgIFxuICAgIEBJbnB1dCgpIHN0eWxlOiBhbnk7XG5cbiAgICBASW5wdXQoKSBzdHlsZUNsYXNzOiBzdHJpbmc7XG5cbiAgICBASW5wdXQoKSBwYW5lbFdpZHRoOiBudW1iZXIgPSA2MDA7XG5cbiAgICBASW5wdXQoKSBwYW5lbEhlaWdodDogbnVtYmVyID0gNDAwO1xuXG4gICAgQElucHV0KCkgZnJhbWVXaWR0aDogbnVtYmVyID0gNjA7XG4gICAgXG4gICAgQElucHV0KCkgZnJhbWVIZWlnaHQ6IG51bWJlciA9IDQwO1xuXG4gICAgQElucHV0KCkgYWN0aXZlSW5kZXg6IG51bWJlciA9IDA7XG5cbiAgICBASW5wdXQoKSBzaG93RmlsbXN0cmlwOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIGF1dG9QbGF5OiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIHRyYW5zaXRpb25JbnRlcnZhbDogbnVtYmVyID0gNDAwMDtcblxuICAgIEBJbnB1dCgpIHNob3dDYXB0aW9uOiBib29sZWFuID0gdHJ1ZTtcblxuICAgIEBJbnB1dCgpIGVmZmVjdER1cmF0aW9uOiBudW1iZXIgPSA1MDA7XG4gICAgXG4gICAgQE91dHB1dCgpIG9uSW1hZ2VDbGlja2VkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuXG4gICAgQE91dHB1dCgpIG9uSW1hZ2VDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgXG4gICAgX2ltYWdlczogYW55W107XG4gICAgXG4gICAgc2xpZGVzaG93QWN0aXZlOiBib29sZWFuO1xuICAgIFxuICAgIHB1YmxpYyBjb250YWluZXI6IGFueTtcbiAgICBcbiAgICBwdWJsaWMgcGFuZWxXcmFwcGVyOiBhbnk7XG4gICAgXG4gICAgcHVibGljIHBhbmVsczogYW55O1xuICAgIFxuICAgIHB1YmxpYyBjYXB0aW9uOiBhbnk7XG4gICAgXG4gICAgcHVibGljIHN0cmlwV3JhcHBlcjogYW55O1xuICAgIFxuICAgIHB1YmxpYyBzdHJpcDogYW55O1xuICAgIFxuICAgIHB1YmxpYyBmcmFtZXM6IGFueTtcbiAgICBcbiAgICBwdWJsaWMgaW50ZXJ2YWw6IGFueTtcbiAgICBcbiAgICBwdWJsaWMgc3RyaXBMZWZ0OiBudW1iZXIgPSAwO1xuICAgIFxuICAgIHB1YmxpYyBpbWFnZXNDaGFuZ2VkOiBib29sZWFuO1xuICAgIFxuICAgIHB1YmxpYyBpbml0aWFsaXplZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBlbDogRWxlbWVudFJlZikge31cbiAgICBcbiAgICBuZ0FmdGVyVmlld0NoZWNrZWQoKSB7XG4gICAgICAgIGlmICh0aGlzLmltYWdlc0NoYW5nZWQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcFNsaWRlc2hvdygpO1xuICAgICAgICAgICAgUHJvbWlzZS5yZXNvbHZlKG51bGwpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbWFnZXNDaGFuZ2VkID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIEBJbnB1dCgpIGdldCBpbWFnZXMoKTogYW55W10ge1xuICAgICAgICByZXR1cm4gdGhpcy5faW1hZ2VzO1xuICAgIH1cbiAgICBzZXQgaW1hZ2VzKHZhbHVlOmFueVtdKSB7XG4gICAgICAgIHRoaXMuX2ltYWdlcyA9IHZhbHVlO1xuICAgICAgICB0aGlzLmltYWdlc0NoYW5nZWQgPSB0cnVlO1xuXG4gICAgICAgIGlmICh0aGlzLmluaXRpYWxpemVkKSB7XG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gMDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAgICAgXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuZWwubmF0aXZlRWxlbWVudC5jaGlsZHJlblswXTtcbiAgICAgICAgdGhpcy5wYW5lbFdyYXBwZXIgPSBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5lbC5uYXRpdmVFbGVtZW50LCAndWwudWktZ2FsbGVyaWEtcGFuZWwtd3JhcHBlcicpO1xuICAgICAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgXG4gICAgICAgIGlmICh0aGlzLnNob3dGaWxtc3RyaXApIHtcbiAgICAgICAgICAgIHRoaXMuc3RyaXBXcmFwcGVyID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGFpbmVyLCdkaXYudWktZ2FsbGVyaWEtZmlsbXN0cmlwLXdyYXBwZXInKTtcbiAgICAgICAgICAgIHRoaXMuc3RyaXAgPSBEb21IYW5kbGVyLmZpbmRTaW5nbGUodGhpcy5zdHJpcFdyYXBwZXIsJ3VsLnVpLWdhbGxlcmlhLWZpbG1zdHJpcCcpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5pbWFnZXMgJiYgdGhpcy5pbWFnZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICB9IFxuICAgIH1cbiAgICBcbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMucGFuZWxzID0gRG9tSGFuZGxlci5maW5kKHRoaXMucGFuZWxXcmFwcGVyLCAnbGkudWktZ2FsbGVyaWEtcGFuZWwnKTsgXG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5zaG93RmlsbXN0cmlwKSB7XG4gICAgICAgICAgICB0aGlzLmZyYW1lcyA9IERvbUhhbmRsZXIuZmluZCh0aGlzLnN0cmlwLCdsaS51aS1nYWxsZXJpYS1mcmFtZScpO1xuICAgICAgICAgICAgdGhpcy5zdHJpcFdyYXBwZXIuc3R5bGUud2lkdGggPSBEb21IYW5kbGVyLndpZHRoKHRoaXMucGFuZWxXcmFwcGVyKSAtIDUwICsgJ3B4JztcbiAgICAgICAgICAgIHRoaXMuc3RyaXBXcmFwcGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuZnJhbWVIZWlnaHQgKyAncHgnO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBpZiAodGhpcy5zaG93Q2FwdGlvbikge1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uID0gRG9tSGFuZGxlci5maW5kU2luZ2xlKHRoaXMuY29udGFpbmVyLCdkaXYudWktZ2FsbGVyaWEtY2FwdGlvbicpO1xuICAgICAgICAgICAgdGhpcy5jYXB0aW9uLnN0eWxlLmJvdHRvbSA9IHRoaXMuc2hvd0ZpbG1zdHJpcCA/IERvbUhhbmRsZXIuZ2V0T3V0ZXJIZWlnaHQodGhpcy5zdHJpcFdyYXBwZXIsdHJ1ZSkgKyAncHgnIDogMCArICdweCc7XG4gICAgICAgICAgICB0aGlzLmNhcHRpb24uc3R5bGUud2lkdGggPSBEb21IYW5kbGVyLndpZHRoKHRoaXMucGFuZWxXcmFwcGVyKSArICdweCc7XG4gICAgICAgIH1cbiAgIFxuICAgICAgICBpZiAodGhpcy5hdXRvUGxheSkge1xuICAgICAgICAgICAgdGhpcy5zdGFydFNsaWRlc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLmNvbnRhaW5lci5zdHlsZS52aXNpYmlsaXR5ID0gJ3Zpc2libGUnO1xuICAgIH1cbiAgICBcbiAgICBzdGFydFNsaWRlc2hvdygpIHtcbiAgICAgICAgdGhpcy5pbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmV4dCgpO1xuICAgICAgICB9LCB0aGlzLnRyYW5zaXRpb25JbnRlcnZhbCk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNsaWRlc2hvd0FjdGl2ZSA9IHRydWU7XG4gICAgfVxuICAgICAgICBcbiAgICBzdG9wU2xpZGVzaG93KCkge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnZhbCkge1xuICAgICAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLmludGVydmFsKTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5zbGlkZXNob3dBY3RpdmUgPSBmYWxzZTtcbiAgICB9XG4gICAgXG4gICAgY2xpY2tOYXZSaWdodCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVzaG93QWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BTbGlkZXNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLm5leHQoKTtcbiAgICB9IFxuICAgIFxuICAgIGNsaWNrTmF2TGVmdCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2xpZGVzaG93QWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLnN0b3BTbGlkZXNob3coKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnByZXYoKTtcbiAgICB9XG4gICAgXG4gICAgZnJhbWVDbGljayhmcmFtZSkge1xuICAgICAgICBpZiAodGhpcy5zbGlkZXNob3dBY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcFNsaWRlc2hvdygpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICB0aGlzLnNlbGVjdChEb21IYW5kbGVyLmluZGV4KGZyYW1lKSwgZmFsc2UpO1xuICAgIH1cbiAgICBcbiAgICBwcmV2KCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpdmVJbmRleCAhPT0gMCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3QodGhpcy5hY3RpdmVJbmRleCAtIDEsIHRydWUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIG5leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZUluZGV4ICE9PSAodGhpcy5wYW5lbHMubGVuZ3RoLTEpKSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCh0aGlzLmFjdGl2ZUluZGV4ICsgMSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdCgwLCBmYWxzZSk7XG4gICAgICAgICAgICB0aGlzLnN0cmlwTGVmdCA9IDA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgICAgIFxuICAgIHNlbGVjdChpbmRleCwgcmVwb3NpdGlvbikge1xuICAgICAgICBpZiAoaW5kZXggIT09IHRoaXMuYWN0aXZlSW5kZXgpIHsgICAgICAgICAgICBcbiAgICAgICAgICAgIGxldCBvbGRQYW5lbCA9IHRoaXMucGFuZWxzW3RoaXMuYWN0aXZlSW5kZXhdLFxuICAgICAgICAgICAgbmV3UGFuZWwgPSB0aGlzLnBhbmVsc1tpbmRleF07XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIERvbUhhbmRsZXIuZmFkZUluKG5ld1BhbmVsLCB0aGlzLmVmZmVjdER1cmF0aW9uKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0ZpbG1zdHJpcCkge1xuICAgICAgICAgICAgICAgIGxldCBvbGRGcmFtZSA9IHRoaXMuZnJhbWVzW3RoaXMuYWN0aXZlSW5kZXhdLFxuICAgICAgICAgICAgICAgIG5ld0ZyYW1lID0gdGhpcy5mcmFtZXNbaW5kZXhdO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChyZXBvc2l0aW9uID09PSB1bmRlZmluZWQgfHwgcmVwb3NpdGlvbiA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZnJhbWVMZWZ0ID0gbmV3RnJhbWUub2Zmc2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgc3RlcEZhY3RvciA9IHRoaXMuZnJhbWVXaWR0aCArIHBhcnNlSW50KGdldENvbXB1dGVkU3R5bGUobmV3RnJhbWUpWydtYXJnaW4tcmlnaHQnXSwgMTApLFxuICAgICAgICAgICAgICAgICAgICBzdHJpcExlZnQgPSB0aGlzLnN0cmlwLm9mZnNldExlZnQsXG4gICAgICAgICAgICAgICAgICAgIGZyYW1lVmlld3BvcnRMZWZ0ID0gZnJhbWVMZWZ0ICsgc3RyaXBMZWZ0LFxuICAgICAgICAgICAgICAgICAgICBmcmFtZVZpZXdwb3J0UmlnaHQgPSBmcmFtZVZpZXdwb3J0TGVmdCArIHRoaXMuZnJhbWVXaWR0aDtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChmcmFtZVZpZXdwb3J0UmlnaHQgPiBEb21IYW5kbGVyLndpZHRoKHRoaXMuc3RyaXBXcmFwcGVyKSlcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RyaXBMZWZ0IC09IHN0ZXBGYWN0b3I7XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGZyYW1lVmlld3BvcnRMZWZ0IDwgMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3RyaXBMZWZ0ICs9IHN0ZXBGYWN0b3I7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICB0aGlzLmFjdGl2ZUluZGV4ID0gaW5kZXg7XG5cbiAgICAgICAgICAgIHRoaXMub25JbWFnZUNoYW5nZS5lbWl0KHtpbmRleDogaW5kZXh9KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBcbiAgICBjbGlja0ltYWdlKGV2ZW50LCBpbWFnZSwgaSkge1xuICAgICAgICB0aGlzLm9uSW1hZ2VDbGlja2VkLmVtaXQoe29yaWdpbmFsRXZlbnQ6IGV2ZW50LCBpbWFnZTogaW1hZ2UsIGluZGV4OiBpfSlcbiAgICB9XG4gICAgICAgIFxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLnN0b3BTbGlkZXNob3coKTtcbiAgICB9XG5cbn1cblxuQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbQ29tbW9uTW9kdWxlXSxcbiAgICBleHBvcnRzOiBbR2FsbGVyaWFdLFxuICAgIGRlY2xhcmF0aW9uczogW0dhbGxlcmlhXVxufSlcbmV4cG9ydCBjbGFzcyBHYWxsZXJpYU1vZHVsZSB7IH0iXX0=