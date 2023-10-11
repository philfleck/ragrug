#pragma once

#include "run_algorithm.h"
#include "RegistrationLibInterface.h"


class RegistrationLib {
    public:
        explicit RegistrationLib();
        ~RegistrationLib();

        bool Configure(std::string configstr);
        bool LoadConfigFromFile(std::string filename, FileType type);

        void Terminate();

        bool LoadModelFromFile(std::string filename, FileType type);

        bool RegisterPoseCallback(RegistrationLib_PoseCallback callback);
        bool UnRegisterPoseCallback();
        bool RegisterSceneFromFile(std::string filename, FileType type);
        bool RegisterSceneFromJsonString(std::string jsonString);
        bool LoadModelFromJsonString(std::string jsonString);

    private:

        struct AlgorithmParameters
        {
             int matching_method      = 1;
          double max_plane_area       = 7;
          double max_plane_ratio      = 8;
          double ppfs_threshold       = 0.08;
          double ppfs_normd_eps       = 0.2;
          double ppfs_quat_eps        = 0.01;
          double ppfs_pos_eps         = 0.2;
          double ppfs_areas_eps       = 0.35;
          double ppfs_lengths_eps     = 0.25;
          double ppfs_ratio_eps       = 0.55;
          double ppfs_votes_std       = 0.6;
          bool allow_multiple_matches = true;
             int solution_test_mode   = 1;
          double solution_thresh_nde  = 12;
          double solution_thresh_pde  = 0.15;
          bool report_inverse_pose = false;
          int verbosity_level = 0;
        } m_algParams;

        std::atomic<bool>       m_runRegistrationThread;
        std::thread*            m_registrationThread;
        std::mutex              m_registerMutex;

        std::vector<Primitive*> m_model_primitives;
        std__matrix<double>     m_model_features;

        void UnloadModel();

        bool Initialize(std::vector<Primitive*>& new_model_primitives);

        RegistrationLib_PoseCallback m_poseCallback;

        bool ReadJSONConfigFromFile(std::string config_datapath);
        bool ReadModelFromJSON(std::vector<Primitive*>& primitives, std::string jsonString);
        bool ReadJSONCadModelFromFile(std::vector<Primitive*>& primitives, std::string model_datapath);
        bool LoadFromFile(std::vector<Primitive*>& primitives, std::string filename, FileType type);

        bool StartRegistration(std::vector<Primitive*>& new_scene_primitives);
        // void PrimitiveRegistrationFunc();

        // https://stackoverflow.com/questions/4555565/generate-all-subsets-of-size-k-from-a-set/8466840#8466840
        void nchoosek(std__matrix<int>& table, int size, int left, int index, std::vector<int> &list) {
            if(left == 0) {
                table.push_back(list);
                return;
            }
            for (int i = index; i < size; i++) {
                list.push_back(i);
                nchoosek(table, size, left-1, i+1, list);
                list.pop_back();
            }
        }
};

using uptr_RegistrationLib = std::unique_ptr<RegistrationLib>;
inline uptr_RegistrationLib mk_uptr_RegistrationLib() {
    return std::make_unique<RegistrationLib>();
}
