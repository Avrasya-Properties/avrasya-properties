import {afterEach,describe,expect,it,vi} from 'vitest';
import {IdleSession,IDLE_LIMIT_MS} from '@/admin/inactivity';
let session:IdleSession|undefined;
afterEach(()=>{session?.stop();session=undefined;vi.useRealTimers();localStorage.clear();});
function start(){vi.useFakeTimers();vi.setSystemTime(new Date('2026-10-15T00:00:00Z'));const expire=vi.fn(),warn=vi.fn();session=new IdleSession(window,'staff',expire,warn);return {expire,warn};}
describe('admin inactivity',()=>{
 it('warns after nine minutes and expires once at ten',()=>{const {expire,warn}=start();vi.advanceTimersByTime(9*60000);expect(expire).not.toHaveBeenCalled();expect(warn).toHaveBeenLastCalledWith(60);vi.advanceTimersByTime(60000);expect(expire).toHaveBeenCalledTimes(1);vi.advanceTimersByTime(60000);expect(expire).toHaveBeenCalledTimes(1);});
 it('keeps an editor active through actual typing, clicks and scrolling',()=>{const {expire}=start();for(const event of ['input','keydown','pointerdown','wheel']){vi.advanceTimersByTime(9*60000);window.dispatchEvent(new Event(event));}expect(expire).not.toHaveBeenCalled();vi.advanceTimersByTime(IDLE_LIMIT_MS);expect(expire).toHaveBeenCalledOnce();});
 it('protects long uploads and gives ten minutes after completion',()=>{const {expire}=start();const done=session!.work();vi.advanceTimersByTime(20*60000);expect(expire).not.toHaveBeenCalled();done();done();vi.advanceTimersByTime(IDLE_LIMIT_MS-1000);expect(expire).not.toHaveBeenCalled();vi.advanceTimersByTime(1000);expect(expire).toHaveBeenCalledOnce();});
 it('does not revive an expired background tab when clicked',()=>{const {expire}=start();vi.setSystemTime(Date.now()+IDLE_LIMIT_MS+1);window.dispatchEvent(new Event('pointerdown'));expect(expire).toHaveBeenCalledOnce();});
 it('does not restart the idle clock on reload',()=>{const {expire}=start();vi.advanceTimersByTime(9*60000);session!.stop();session=new IdleSession(window,'staff',expire,vi.fn());vi.advanceTimersByTime(60000);expect(expire).toHaveBeenCalledOnce();});
 it('honours work in another tab and lets stale work leases expire',()=>{const {expire}=start();vi.advanceTimersByTime(9*60000);localStorage.setItem('avrasya:admin-work:staff:other',String(Date.now()+15000));vi.advanceTimersByTime(10000);expect(expire).not.toHaveBeenCalled();vi.advanceTimersByTime(IDLE_LIMIT_MS+15000);expect(expire).toHaveBeenCalledOnce();});
 it('uses shared activity without treating focus as activity',()=>{const {expire}=start();vi.advanceTimersByTime(9*60000);localStorage.setItem('avrasya:admin-activity:staff',String(Date.now()));window.dispatchEvent(new Event('storage'));vi.advanceTimersByTime(9*60000);window.dispatchEvent(new Event('focus'));vi.advanceTimersByTime(60000);expect(expire).toHaveBeenCalledOnce();});
});
