/* eslint-disable no-console */
import { LightningElement, api } from 'lwc';

export default class Messages extends LightningElement {
    @api messages;
 
    close(){
        const selectEvent = new CustomEvent('close', {
            detail: true
        });
        this.dispatchEvent(selectEvent);
    }

}