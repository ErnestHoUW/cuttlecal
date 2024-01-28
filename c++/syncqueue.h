#include <queue>
#include <mutex>
#include <condition_variable>

using namespace std;

template <typename T>
class SyncQueue {
private:
    queue<T> q;
    mutex m;
    condition_variable cv;
    bool stopFlag = false;

public:
    void push(const T& item) {
        lock_guard<mutex> lock(m);
        q.push(item);
        cv.notify_one();
    }

    pair<bool, T> pop() {
        unique_lock<mutex> lock(m);
        while(q.empty() && !stopFlag) {
            cv.wait(lock);
        }
        if(stopFlag && q.empty()) return {false, T()};
        T val = q.front();
        q.pop();
        return {true, val};
    }

    bool empty() {
        lock_guard<mutex> lock(m);
        return q.empty();
    }

    void stop() {
        lock_guard<mutex> lock(m);
        stopFlag = true;
        cv.notify_all();
    }

    bool stopped() {
        lock_guard<mutex> lock(m);
        return stopFlag;
    }

    void reset() {
        unique_lock<mutex> lock(m);
        while (!q.empty()) {
            q.pop();
        }
        stopFlag = false;
        cv.notify_all();
    }
};